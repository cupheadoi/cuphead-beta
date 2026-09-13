export default function handler(_req, res) {
  res
    .status(410)
    .json({
      error:
        "This Vercel deployment serves the frontend only. Configure VITE_API_BASE_URL to a persistent CupHead API service.",
    });
}
