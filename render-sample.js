const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
(async()=>{
  const pdf=await PDFDocument.load(fs.readFileSync('assets/certificate-template.pdf'));
  const page=pdf.getPages()[0], {width}=page.getSize();
  const regular=await pdf.embedFont(StandardFonts.TimesRoman);
  const bold=await pdf.embedFont(StandardFonts.TimesRomanBold);
  const paper=rgb(1,.996,.976),navy=rgb(.025,.23,.48);
  const name='SAMPLE PARTICIPANT';
  page.drawRectangle({x:142,y:350,width:560,height:27,color:paper});
  page.drawText(name,{x:(width-bold.widthOfTextAtSize(name,22))/2,y:356,size:22,font:bold,color:navy});
  page.drawRectangle({x:235,y:208,width:140,height:22,color:rgb(.94,.97,1)});
  page.drawRectangle({x:510,y:208,width:158,height:22,color:rgb(.94,.97,1)});
  page.drawText('ARDO-TEST-001',{x:242,y:214,size:12,font:bold,color:navy});
  page.drawText('9876543210',{x:520,y:214,size:12,font:regular,color:navy});
  fs.writeFileSync('/tmp/ardo-sample.pdf',await pdf.save());
  console.log('Sample certificate rendered.');
})().catch(e=>{console.error(e);process.exit(1)});
