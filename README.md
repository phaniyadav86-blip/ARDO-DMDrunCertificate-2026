# ARDO E-Certificate 2026

Static GitHub Pages application for verifying participants of the World Duchenne Muscular Dystrophy Awareness Day Walk & Run and generating a high-quality PDF participation certificate.

## Privacy

The participant spreadsheet is never published. The deployed site stores only SHA-256 hashes of normalized `Ticket ID|Primary Phone` pairs. Data entered by a participant is processed locally in the browser and is not transmitted or stored.

## Update the participant roster

Run:

```bash
npm run generate-data -- "/path/to/participants.csv" "assets/verification-data.js"
```

The CSV must contain `Ticket ID` and `Primary Phone` headers. Commit only the generated `assets/verification-data.js`; never commit the original roster.

## Local preview

Serve the repository through any static HTTP server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

After pushing to `main`, open **Settings → Pages**, choose **GitHub Actions** as the source, and run the included deployment workflow if it has not started automatically.
