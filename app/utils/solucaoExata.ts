const solucaoExata = (t, r, K, y0) => (K * y0) / (y0 + (K - y0) * Math.exp(-r * t));
export default solucaoExata;