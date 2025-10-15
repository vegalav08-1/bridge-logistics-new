import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: { http_req_duration: ['p(95)<800'] }
};

export default function () {
  const res = http.get('http://localhost:3000/api/health');
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}




