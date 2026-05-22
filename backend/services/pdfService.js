const PDFDocument = require('pdfkit');

exports.generatePDF = (res, report) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.repo.replace('/', '-')}-report.pdf"`);

  // Stream the document directly to the HTTP response
  doc.pipe(res);

  // Document Header
  doc.fontSize(24).font('Helvetica-Bold').text('DevTrackr AI Report', { align: 'center' });
  doc.moveDown(0.5);
  
  doc.fontSize(14).font('Helvetica').text(`Repository: ${report.repo}`, { align: 'center' });
  doc.fontSize(10).fillColor('gray').text(`Generated Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  // Reusable Helper for Text Sections
  const addSection = (title, content) => {
    if (!content) return;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text(title);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#000000').text(content, { lineGap: 4 });
    doc.moveDown(1.5);
  };

  // Reusable Helper for List Sections
  const addListSection = (title, items) => {
    if (!items || !items.length) return;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333').text(title);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#000000');
    items.forEach(item => {
      let text = '';
      if (typeof item === 'string') {
        text = item;
      } else if (typeof item === 'object' && item !== null) {
        if (item.contributor) {
          text = `${item.contributor}: ${item.insight || item.activity || ''}`;
        } else if (item.risk) {
          text = `${item.risk}: ${item.consequence || ''}`;
        } else if (item.issue) {
          text = `${item.issue} (Impact: ${item.impact || 'N/A'} - Action: ${item.solution || 'N/A'})`;
        } else {
          text = Object.entries(item).map(([k,v]) => `${k}: ${v}`).join(' | ');
        }
      } else {
        text = String(item);
      }
      doc.text(`• ${text}`, { lineGap: 4 });
    });
    doc.moveDown(1.5);
  };

  addSection('Sprint Summary', report.summary);
  addSection('Project Health', report.projectHealth);
  addSection('Commit Analysis', report.commitAnalysis);
  addSection('Pull Request Analysis', report.pullRequestAnalysis);
  addSection('Issue Analysis', report.issueAnalysis);

  addListSection('Contributor Insights', report.contributorInsights);
  addListSection('Bottlenecks', report.bottlenecks);
  addListSection('Technical Risks', report.technicalRisks);
  addListSection('Recommendations', report.recommendations);

  doc.end();
};