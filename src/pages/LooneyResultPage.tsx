import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IconAlertTriangle, IconArrowLeft } from '@tabler/icons-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LooneyResultDisplay from '@/components/LooneyResultDisplay';
import { LooneyHistoryRecord } from '@/types/looney';
import { loadLooneyHistory, looneyHistoryUpdateEvent } from '@/utils/looneyHistory';

const LooneyResultPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<LooneyHistoryRecord | null>(() => loadLooneyHistory().find((item) => item.jobId === jobId) || null);
  useEffect(() => { const refresh = () => setRecord(loadLooneyHistory().find((item) => item.jobId === jobId) || null); window.addEventListener(looneyHistoryUpdateEvent, refresh); return () => window.removeEventListener(looneyHistoryUpdateEvent, refresh); }, [jobId]);
  const running = record?.status === 'queued' || record?.status === 'running';
  return <div className="flex min-h-screen flex-col"><Helmet><title>{record?.sourceLabel || 'Check result'} - Looney</title></Helmet><Navbar /><main className="flex-grow cow-grid-bg bg-background px-4 pb-20 pt-28"><div className="container mx-auto max-w-6xl"><Link to="/gappa" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" /> Back to checks</Link><div className="mx-auto mt-10 max-w-3xl text-center"><h1 className="font-minecraftia text-3xl leading-relaxed md:text-5xl">Check result</h1><p className="mt-4 text-base text-muted-foreground">A saved Looney research report, ready to review before publishing.</p></div>{record?.result ? <div className="mx-auto mt-10 max-w-5xl"><LooneyResultDisplay result={record.result} sourceType={record.sourceType} sourceLabel={record.sourceLabel} onClose={() => navigate('/gappa')} /></div> : running ? <div className="mx-auto mt-10 max-w-lg rounded-xl border-2 border-cow-purple/40 bg-cow-purple/5 p-6 text-center"><IconAlertTriangle className="mx-auto h-8 w-8 text-cow-purple" /><h2 className="mt-4 font-minecraftia text-base">Check in progress</h2><p className="mt-3 break-words text-sm text-muted-foreground">{record.progress || 'Looney is researching this source.'}</p></div> : <div className="mx-auto mt-10 max-w-lg rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-6 text-center"><IconAlertTriangle className="mx-auto h-8 w-8 text-amber-500" /><h2 className="mt-4 font-minecraftia text-base">Check failed</h2><p className="mt-3 break-words text-sm text-muted-foreground">{record?.error || 'Looney could not complete this check.'}</p><Link to="/gappa" className="mt-5 inline-block font-semibold text-cow-purple">Return to checks</Link></div>}</div></main><Footer /></div>;
};

export default LooneyResultPage;
