function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= rating ? "text-yellow-400" : "text-ink-300"}>★</span>
    );
  }
  return <span className="text-lg">{stars}</span>;
}

export default StarRating;
