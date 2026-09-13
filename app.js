const { PDFDocument, StandardFonts, rgb } = PDFLib;
const form = document.getElementById('certificate-form');
const statusEl = document.getElementById('status');
const previewSection = document.getElementById('preview-section');
const preview = document.getElementById('preview');
const viewButton = document.getElementById('view');
const downloadButton = document.getElementById('download');
let pdfUrl = null;
let pdfBytes = null;
let certificateName = '';

const normalizeTicket = value => value.replace(/\s+/g, '').toUpperCase();
const normalizePhone = value => value.replace(/\D/g, '').slice(-10);

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function fitText(font, text, maxSize, maxWidth) {
  let size = maxSize;
  while (size > 12 && font.widthOfTextAtSize(text, size) > maxWidth) size -= .5;
  return size;
}

async function buildCertificate(name, ticket, mobile) {
  const template = await fetch('assets/certificate-template.pdf').then(r => {
    if (!r.ok) throw new Error('Certificate template could not be loaded.');
    return r.arrayBuffer();
  });
  const pdf = await PDFDocument.load(template);
  const page = pdf.getPages()[0];
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const paper = rgb(1, .996, .976);
  const navy = rgb(.025, .23, .48);

  page.drawRectangle({ x:142, y:350, width:560, height:27, color:paper });
  const nameSize = fitText(bold, name, 22, 530);
  page.drawText(name, { x:(width-bold.widthOfTextAtSize(name,nameSize))/2, y:356, size:nameSize, font:bold, color:navy });

  page.drawRectangle({ x:235, y:208, width:140, height:22, color:rgb(.94,.97,1) });
  page.drawRectangle({ x:510, y:208, width:158, height:22, color:rgb(.94,.97,1) });
  page.drawText(ticket, { x:242, y:214, size:12, font:bold, color:navy });
  page.drawText(mobile, { x:520, y:214, size:12, font:regular, color:navy });
  pdf.setTitle(`ARDO Certificate - ${name}`);
  pdf.setAuthor('Amaravathi Rare Diseases Organization');
  pdf.setSubject('Certificate of Participation - World Duchenne Muscular Dystrophy Awareness Day Walk & Run 2026');
  return pdf.save();
}

function setStatus(message, type='') { statusEl.textContent=message; statusEl.className=`status ${type}`; }
function revokePdf() { if (pdfUrl) URL.revokeObjectURL(pdfUrl); pdfUrl=null; }
function showPreview() { if (!pdfUrl) return; preview.src=pdfUrl; previewSection.hidden=false; previewSection.scrollIntoView({behavior:'smooth',block:'start'}); }

form.addEventListener('submit', async event => {
  event.preventDefault();
  const name=document.getElementById('name').value.trim().replace(/\s+/g,' ');
  const ticket=normalizeTicket(document.getElementById('ticket').value);
  const mobile=normalizePhone(document.getElementById('mobile').value);
  viewButton.disabled=downloadButton.disabled=true;
  previewSection.hidden=true;
  if (name.length < 2 || !ticket || mobile.length !== 10) { setStatus('Please enter a valid name, Ticket ID, and 10-digit mobile number.','error'); return; }
  setStatus('Verifying your registration…');
  try {
    const hash=await sha256(`${ticket}|${mobile}`);
    if (!window.ARDO_VERIFICATION_HASHES.has(hash)) { setStatus('Ticket ID and mobile number do not match our registration records.','error'); return; }
    setStatus('Verified. Generating your certificate…');
    pdfBytes=await buildCertificate(name,ticket,mobile);
    revokePdf();
    pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));
    certificateName=`ARDO-Certificate-${ticket}.pdf`;
    viewButton.disabled=downloadButton.disabled=false;
    setStatus('Certificate generated successfully.','success');
    showPreview();
  } catch (error) { console.error(error); setStatus('Unable to generate the certificate. Please refresh and try again.','error'); }
});
viewButton.addEventListener('click', showPreview);
downloadButton.addEventListener('click', () => { if (!pdfUrl) return; const a=document.createElement('a'); a.href=pdfUrl; a.download=certificateName; document.body.appendChild(a); a.click(); a.remove(); });
window.addEventListener('beforeunload', revokePdf);
