async function test() {
  const res = await fetch('http://127.0.0.1:8000/api/store/home/featured-products');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
