"use client";

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import Layout from '../components/Layout';

// Dynamically import Map component with no SSR because Leaflet uses window
const Map = dynamic(() => import('../components/Map'), { ssr: false });

function HomeContent() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || 'last_year';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const apiUrl = '/api';
      const res = await fetch(`${apiUrl}/strava/data?year=${year}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [year]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-between">

      <div className="w-full h-[80vh] relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">Loading activities...</div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">Error: {error}</div>
        ) : (
          <Map activities={activities} />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading map...</div>}>
        <HomeContent />
      </Suspense>
    </Layout>
  );
}
