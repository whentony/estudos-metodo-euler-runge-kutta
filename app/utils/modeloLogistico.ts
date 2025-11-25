const modeloLogistico = (t, y, r, K) => r * y * (1 - y / K);
export default modeloLogistico;