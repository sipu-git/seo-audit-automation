export const reportStyles = `
  @page { size: A4; margin: 17mm 15mm 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #20322a; font: 10pt/1.5 Arial, Helvetica, sans-serif; }
  .brand { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #dce9e1; color: #688176; font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; }
  .brand strong { color: #087a57; font-size: 10pt; }
  .hero { padding: 24px 0 18px; }
  .eyebrow { margin: 0 0 5px; color: #10845e; font-size: 8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
  h1 { margin: 0; color: #173a2c; font-size: 25pt; line-height: 1.15; }
  .site { margin: 7px 0 0; overflow-wrap: anywhere; color: #708078; }
  .meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .meta span { padding: 5px 9px; border: 1px solid #dce9e1; border-radius: 99px; color: #52665b; font-size: 8pt; }
  .score-panel { display: flex; gap: 18px; align-items: center; margin: 2px 0 18px; padding: 17px; border: 1px solid #dce9e1; border-radius: 12px; background: #f5faf7; }
  .score { display: grid; flex: 0 0 74px; width: 74px; height: 74px; place-items: center; border: 6px solid #a4ddc0; border-radius: 50%; color: #14583c; font-size: 22pt; font-weight: 700; }
  .score small { display: block; margin-top: -22px; color: #789087; font-size: 7pt; font-weight: 400; }
  .score-copy h2 { margin: 0 0 4px; font-size: 13pt; }
  .score-copy p { margin: 0; color: #61736a; }
  .breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin: 0 0 20px; }
  .breakdown-row { break-inside: avoid; }
  .breakdown-label { display: flex; justify-content: space-between; gap: 8px; color: #607169; font-size: 8pt; }
  .track { height: 5px; margin-top: 4px; overflow: hidden; border-radius: 5px; background: #e6eee9; }
  .track i { display: block; height: 100%; border-radius: inherit; background: #28a875; }
  .section-title { margin: 20px 0 10px; color: #203b2e; font-size: 14pt; }
  .issue-section { margin: 16px 0 20px; break-inside: auto; }
  .section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e5ece8; }
  .section-marker { width: 4px; height: 30px; border-radius: 4px; background: #35a879; }
  .section-marker.red { background: #d97068; }.section-marker.amber { background: #d8a144; }.section-marker.blue { background: #6997d4; }
  .section-heading h2 { margin: 0; font-size: 12pt; }.section-heading p { margin: 2px 0 0; color: #7d8c84; font-size: 8pt; }
  .count { margin-left: auto; color: #73837a; font-size: 8pt; }
  .issue-list { display: grid; gap: 8px; }
  .issue-card { padding: 11px 12px; border: 1px solid #e6ece8; border-radius: 8px; break-inside: avoid; }
  .issue-kicker { display: flex; align-items: center; gap: 7px; color: #89968f; font-size: 7pt; }
  .priority { padding: 2px 6px; border-radius: 99px; background: #f1f4f2; color: #68776e; font-weight: 700; text-transform: uppercase; }
  .category { margin-left: auto; }
  .issue-card h3 { margin: 7px 0 4px; color: #2e4136; font-size: 10pt; }
  .issue-card p { margin: 0; color: #617168; font-size: 9pt; }
  .issue-meta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; color: #7d8b83; font-size: 8pt; }.issue-meta b { color: #4a5d52; }
  .verify { display: grid; gap: 2px; margin-top: 8px; padding-top: 7px; border-top: 1px solid #edf1ee; color: #667d70; font-size: 8pt; }
  .empty-state { padding: 8px 0; color: #8a9890; font-size: 9pt; }
  .sources { margin-top: 18px; padding: 12px; border-radius: 8px; background: #f6f8f7; color: #697a70; font-size: 8pt; }
  .sources h2 { margin: 0 0 5px; color: #32483a; font-size: 10pt; }.sources ul { margin: 0; padding-left: 17px; }
  .note { margin-top: 10px; color: #89968f; font-size: 8pt; }
`;
