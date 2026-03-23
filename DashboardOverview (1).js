import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import KPIGrid from '../components/KPIGrid';
import ChartCard from '../components/ChartCard';
import {
  FiveYearChart,
  LeadOutcomesChart,
  MonthlyTrendChart,
  CivilDefenceChart,
  LeadSubTypesChart,
  DomainWinLossChart,
  Top10Chart,
} from '../components/Charts';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/**
 * Returns the Indian Financial Year string (e.g. "FY 24-25")
 * for a given date value (string or Date object).
 */
function getFY(dateVal) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d)) return null;
  const month = d.getMonth(); // 0-based; April = 3
  const year  = d.getFullYear();
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd   = (fyStart + 1) % 100;
  return `FY ${String(fyStart).slice(2)}-${String(fyEnd).padStart(2, '0')}`;
}

/** Returns the current Indian Financial Year string. */
function currentFY() {
  return getFY(new Date());
}

/** Returns the previous Indian Financial Year string. */
function previousFY() {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();
  const fyStart = month >= 3 ? year - 1 : year - 2;
  const fyEnd   = (fyStart + 1) % 100;
  return `FY ${String(fyStart).slice(2)}-${String(fyEnd).padStart(2, '0')}`;
}

/** Safe float parser — returns 0 for empty / non-numeric values. */
function toFloat(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

/* ─────────────────────────────────────────────
   STATUS CLASSIFIERS
   Matches against presentStatus values in a
   case-insensitive, substring-based way so any
   variation ("Order Received", "Won", etc.) is
   correctly bucketed.
───────────────────────────────────────────── */
const WON_KEYWORDS    = ['order received', 'won', 'order placed'];
const LOST_KEYWORDS   = ['lost', 'not awarded'];
const PART_KEYWORDS   = ['participated', 'bid submitted', 'submitted'];
const NOPART_KEYWORDS = ['not participated', 'dropped', 'cancelled'];

const matchStatus = (keywords) => (row) =>
  keywords.some(k => (row.presentStatus || '').toLowerCase().includes(k));

const isWon    = matchStatus(WON_KEYWORDS);
const isLost   = matchStatus(LOST_KEYWORDS);
const isPart   = matchStatus(PART_KEYWORDS);
const isNoPart = matchStatus(NOPART_KEYWORDS);

/* ─────────────────────────────────────────────
   DATA TRANSFORMATION  (raw DB rows → chart data)
───────────────────────────────────────────── */

function buildDerivedData(rows, thisFY, prevFY) {

  // ── Collect all FY labels present in data (sorted) ──
  const fySet = new Set();
  rows.forEach(r => {
    const fy = getFY(r.dateOfLetterSubmission);
    if (fy) fySet.add(fy);
  });
  const allFYs = Array.from(fySet).sort();

  // ── Row slices by FY ──
  const thisFYRows = rows.filter(r => getFY(r.dateOfLetterSubmission) === thisFY);
  const prevFYRows = rows.filter(r => getFY(r.dateOfLetterSubmission) === prevFY);

  /* ── 1. KPIs ─────────────────────────────── */
  const totalOrders     = rows.filter(isWon).length;
  const prevOrders      = prevFYRows.filter(isWon).length;

  const totalOrderValue = rows.filter(isWon)
    .reduce((s, r) => s + toFloat(r.submittedValueInCrWithoutGST), 0);
  const prevOrderValue  = prevFYRows.filter(isWon)
    .reduce((s, r) => s + toFloat(r.submittedValueInCrWithoutGST), 0);

  const bqsSubmitted = thisFYRows.length;
  const prevBQs      = prevFYRows.length;

  const leadsInQueue     = thisFYRows.filter(r => !isWon(r) && !isLost(r)).length;
  const prevLeadsInQueue = prevFYRows.filter(r => !isWon(r) && !isLost(r)).length;

  const wonThisFY   = thisFYRows.filter(isWon).length;
  const wonPrevFY   = prevFYRows.filter(isWon).length;
  const winRate     = thisFYRows.length ? Math.round((wonThisFY / thisFYRows.length) * 100) : 0;
  const prevWinRate = prevFYRows.length ? Math.round((wonPrevFY / prevFYRows.length) * 100) : 0;

  const lostThisFY = thisFYRows.filter(isLost).length;
  const lostPrevFY = prevFYRows.filter(isLost).length;

  const fmt = (n) => (n >= 0 ? `+${n}` : `${n}`);

  const kpis = [
    {
      label: 'Leads in Queue',
      value: leadsInQueue,
      delta: `${fmt(leadsInQueue - prevLeadsInQueue)} vs last FY`,
      deltaType: leadsInQueue >= prevLeadsInQueue ? 'up' : 'down',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      delta: `${fmt(totalOrders - prevOrders)} vs last FY`,
      deltaType: totalOrders >= prevOrders ? 'up' : 'down',
    },
    {
      label: 'Order Value (Cr)',
      value: `₹${totalOrderValue.toFixed(1)}`,
      delta: `${totalOrderValue >= prevOrderValue ? '+' : ''}₹${(totalOrderValue - prevOrderValue).toFixed(1)} vs last FY`,
      deltaType: totalOrderValue >= prevOrderValue ? 'up' : 'down',
    },
    {
      label: 'BQs Submitted',
      value: bqsSubmitted,
      delta: bqsSubmitted === prevBQs
        ? 'same as last FY'
        : `${fmt(bqsSubmitted - prevBQs)} vs last FY`,
      deltaType: bqsSubmitted >= prevBQs ? 'up' : 'down',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      delta: `${fmt(winRate - prevWinRate)}% vs last FY`,
      deltaType: winRate >= prevWinRate ? 'up' : 'down',
    },
    {
      label: 'Lost Leads',
      value: lostThisFY,
      delta: `${fmt(lostThisFY - lostPrevFY)} vs last FY`,
      // more lost = bad → invert deltaType
      deltaType: lostThisFY > lostPrevFY ? 'down' : 'up',
    },
  ];

  /* ── 2. Five-Year Chart ──────────────────── */
  const last5FYs     = allFYs.slice(-5);
  const fiveYearData = last5FYs.map(fy => {
    const fyRows = rows.filter(r => getFY(r.dateOfLetterSubmission) === fy);
    const orders = fyRows.filter(isWon).length;
    const value  = parseFloat(
      fyRows.filter(isWon)
        .reduce((s, r) => s + toFloat(r.submittedValueInCrWithoutGST), 0)
        .toFixed(2)
    );
    return { fy, orders, value };
  });

  /* ── 3. Lead Outcomes Pie ────────────────── */
  const total = rows.length || 1;
  const leadOutcomesData = [
    { name: 'Won',          value: Math.round((rows.filter(isWon).length    / total) * 100), color: '#16a34a' },
    { name: 'Lost',         value: Math.round((rows.filter(isLost).length   / total) * 100), color: '#dc2626' },
    { name: 'Participated', value: Math.round((rows.filter(isPart).length   / total) * 100), color: '#2563eb' },
    { name: 'Not-Part.',    value: Math.round((rows.filter(isNoPart).length / total) * 100), color: '#d97706' },
  ];

  /* ── 4. Monthly Trend ────────────────────── */
  // Indian FY month order: Apr … Mar
  const MONTHS     = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
  const MONTH_IDXS = { Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,Jan:0,Feb:1,Mar:2 };

  const countByMonth = (fyRows, monthLabel) =>
    fyRows.filter(r => {
      const d = new Date(r.dateOfLetterSubmission);
      return !isNaN(d) && d.getMonth() === MONTH_IDXS[monthLabel];
    }).length;

  // Keys are the dynamic FY strings so MonthlyTrendChart can use them as dataKeys
  const monthlyTrendData = MONTHS.map(month => ({
    month,
    [thisFY]: countByMonth(thisFYRows, month),
    [prevFY]: countByMonth(prevFYRows, month),
  }));

  /* ── 5. Civil vs Defence ─────────────────── */
  const isDefence = (r) => (r.defenceAndNonDefence || '').toLowerCase().includes('defence');
  const civilDefenceData = [
    {
      category: 'Leads',
      Civil:   rows.filter(r => !isDefence(r)).length,
      Defence: rows.filter(r =>  isDefence(r)).length,
    },
    {
      category: 'Orders',
      Civil:   rows.filter(r => isWon(r) && !isDefence(r)).length,
      Defence: rows.filter(r => isWon(r) &&  isDefence(r)).length,
    },
  ];

  /* ── 6. Lead Sub-Types (current FY) ─────── */
  const subTypeCounts = {};
  thisFYRows.forEach(r => {
    const key = r.defenceAndNonDefence || 'Other';
    subTypeCounts[key] = (subTypeCounts[key] || 0) + 1;
  });
  const subTypeColors    = ['#2563eb','#0d9488','#7c3aed','#d97706','#dc2626'];
  const leadSubTypesData = Object.entries(subTypeCounts).map(([name, value], i) => ({
    name,
    value,
    color: subTypeColors[i % subTypeColors.length],
  }));

  /* ── 7. Win/Loss by Domain ───────────────── */
  const domainMap = {};
  rows.forEach(r => {
    const domain = r.defenceAndNonDefence || 'Other';
    if (!domainMap[domain]) domainMap[domain] = { Won: 0, Lost: 0 };
    if (isWon(r))  domainMap[domain].Won++;
    if (isLost(r)) domainMap[domain].Lost++;
  });
  const domainWinLossData = Object.entries(domainMap).map(([domain, v]) => ({
    domain,
    Won:  v.Won,
    Lost: v.Lost,
  }));

  /* ── 8. Top 10 Customers ─────────────────── */
  const customerMap = {};
  rows.filter(isWon).forEach(r => {
    const name = r.customerName || 'Unknown';
    customerMap[name] = (customerMap[name] || 0) + toFloat(r.submittedValueInCrWithoutGST);
  });
  const top10CustomersData = Object.entries(customerMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  /* ── 9. Lost Leads Table ─────────────────── */
  const lostLeadsTableData = rows.filter(isLost).map(r => {
    let competitors = [];
    try {
      const parsed = JSON.parse(r.JSON_competitors || '[]');
      competitors  = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      competitors = r.JSON_competitors ? [r.JSON_competitors] : [];
    }
    return {
      tenderName: r.bqTitle || '—',
      customer:   r.customerName || '—',
      domain:     r.defenceAndNonDefence || '—',
      value: r.submittedValueInCrWithoutGST
        ? `₹${toFloat(r.submittedValueInCrWithoutGST).toFixed(2)}`
        : '—',
      competitor: competitors.length
        ? competitors.map(c => (typeof c === 'object' ? c.name || JSON.stringify(c) : c)).join(', ')
        : '—',
      reason: r.presentStatus || '—',
      date: r.dateOfLetterSubmission
        ? new Date(r.dateOfLetterSubmission).toLocaleDateString('en-IN')
        : '—',
    };
  });

  return {
    kpis,
    fiveYearData,
    leadOutcomesData,
    monthlyTrendData,
    civilDefenceData,
    leadSubTypesData,
    domainWinLossData,
    top10CustomersData,
    lostLeadsTableData,
  };
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

export default function DashboardOverview() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Compute FY labels once — they don't change during a session
  const thisFY = useMemo(() => currentFY(),  []);
  const prevFY = useMemo(() => previousFY(), []);

  /* ── Fetch ALL rows from the backend ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Read server IP from config.json (same pattern as BudgetaryQuotationForm.js)
        const configRes = await axios.get('/config.json');
        const serverIP  = configRes.data.project[0].ServerIP[0].NodeServerIP;

        const dataRes = await axios.get(`${serverIP}/getBudgetaryQuotation`);
        // Controller returns { data: [...] }
        const payload = dataRes.data?.data ?? dataRes.data ?? [];
        setRows(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('DashboardOverview fetch error:', err);
        setError('Failed to load data from the server. Please refresh and try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Derive chart data only when rows change ── */
  const derived = useMemo(
    () => (rows.length ? buildDerivedData(rows, thisFY, prevFY) : null),
    [rows, thisFY, prevFY]
  );

  /* ── Loading ── */
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  /* ── Empty ── */
  if (!derived) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No Budgetary Quotation records found in the database.</Alert>
      </Box>
    );
  }

  const {
    kpis,
    fiveYearData,
    leadOutcomesData,
    monthlyTrendData,
    civilDefenceData,
    leadSubTypesData,
    domainWinLossData,
    top10CustomersData,
    lostLeadsTableData,
  } = derived;

  /* ── Render ── */
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* KPIs */}
      <KPIGrid kpis={kpis} />

      {/* Charts Grid 1 */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <ChartCard
            title="5-year order history"
            subtitle="Order count & value (Cr) by financial year"
            chip={{ label: '5 years', type: 'blue' }}
            legend={[
              { label: 'Orders (count)', color: '#2563eb' },
              { label: 'Value (Cr)',     color: '#7c3aed' },
            ]}
          >
            <FiveYearChart data={fiveYearData} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Lead outcomes"
            subtitle="All-time distribution"
            chip={{ label: 'All time', type: 'green' }}
            legend={[
              { label: `Won ${leadOutcomesData[0]?.value ?? 0}%`,          color: '#16a34a' },
              { label: `Lost ${leadOutcomesData[1]?.value ?? 0}%`,         color: '#dc2626' },
              { label: `Participated ${leadOutcomesData[2]?.value ?? 0}%`, color: '#2563eb' },
              { label: `Not-Part. ${leadOutcomesData[3]?.value ?? 0}%`,    color: '#d97706' },
            ]}
          >
            <LeadOutcomesChart data={leadOutcomesData} />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Grid 2 */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Monthly BQ trend"
            subtitle="Submissions by month"
            chip={{ label: '2 years', type: 'blue' }}
            legend={[
              { label: thisFY, color: '#2563eb' },
              { label: prevFY, color: '#d1d5db' },
            ]}
          >
            {/* Pass dynamic FY keys — chart uses them as Recharts dataKeys */}
            <MonthlyTrendChart
              data={monthlyTrendData}
              thisFY={thisFY}
              prevFY={prevFY}
            />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Civil vs. Defence"
            subtitle="Lead & order split"
            chip={{ label: 'Mix', type: 'amber' }}
            legend={[
              { label: 'Civil',   color: '#2563eb' },
              { label: 'Defence', color: '#7c3aed' },
            ]}
          >
            <CivilDefenceChart data={civilDefenceData} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Lead sub-types"
            subtitle={`Distribution — ${thisFY}`}
            chip={{ label: `${leadSubTypesData.length} types`, type: 'blue' }}
            legend={leadSubTypesData.map(d => ({ label: d.name, color: d.color }))}
          >
            <LeadSubTypesChart data={leadSubTypesData} />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Grid 3 */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <ChartCard
            title="Win / loss by business domain"
            subtitle="Stacked by outcome"
            chip={{ label: 'Domain view', type: 'green' }}
            legend={[
              { label: 'Won',  color: '#16a34a' },
              { label: 'Lost', color: '#dc2626' },
            ]}
          >
            <DomainWinLossChart data={domainWinLossData} />
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartCard
            title="Top 10 customers"
            subtitle="By total order value (Cr)"
            chip={{ label: 'All-time', type: 'blue' }}
          >
            <Top10Chart data={top10CustomersData} />
          </ChartCard>
        </Grid>
      </Grid>

      {/* Lost Leads Table */}
      <Paper sx={{ border: '1px solid #e4e8ef', borderRadius: '14px', overflow: 'hidden' }}>
        <Box
          sx={{
            padding: '16px 20px',
            borderBottom: '1px solid #e4e8ef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f1117' }}>
              Lost lead analysis
            </div>
            <div style={{ fontSize: '11px', color: '#8892a4', marginTop: '2px' }}>
              Detailed breakdown of all lost opportunities ({lostLeadsTableData.length} records)
            </div>
          </Box>
          <Button
            variant="outlined"
            size="small"
            sx={{
              fontSize: '12px',
              padding: '6px 12px',
              border: '1px solid #d0d5e0',
              borderRadius: '7px',
              backgroundColor: '#ffffff',
              color: '#525868',
              textTransform: 'none',
            }}
          >
            Analyse with AI ↗
          </Button>
        </Box>

        <TableContainer>
          <Table sx={{ fontSize: '12px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f3f7' }}>
                {['Tender Name','Customer','Domain','Value (Cr)','Competitor','Reason','Date'].map(col => (
                  <TableCell
                    key={col}
                    sx={{
                      fontSize: '10px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: '#8892a4',
                      borderColor: '#e4e8ef',
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lostLeadsTableData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    sx={{ textAlign: 'center', color: '#8892a4', py: 4 }}
                  >
                    No lost leads found.
                  </TableCell>
                </TableRow>
              ) : (
                lostLeadsTableData.map((row, idx) => (
                  <TableRow
                    key={idx}
                    sx={{ borderColor: '#e4e8ef', '&:hover': { backgroundColor: '#f1f3f7' } }}
                  >
                    <TableCell sx={{ color: '#525868', borderColor: '#e4e8ef' }}>{row.tenderName}</TableCell>
                    <TableCell sx={{ color: '#525868', borderColor: '#e4e8ef' }}>{row.customer}</TableCell>
                    <TableCell sx={{ color: '#525868', borderColor: '#e4e8ef' }}>{row.domain}</TableCell>
                    <TableCell sx={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, color: '#0f1117', borderColor: '#e4e8ef' }}>
                      {row.value}
                    </TableCell>
                    <TableCell sx={{ color: '#525868', borderColor: '#e4e8ef' }}>{row.competitor}</TableCell>
                    <TableCell sx={{ color: '#525868', borderColor: '#e4e8ef' }}>{row.reason}</TableCell>
                    <TableCell sx={{ fontFamily: '"DM Mono", monospace', fontWeight: 500, color: '#0f1117', borderColor: '#e4e8ef' }}>
                      {row.date}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
