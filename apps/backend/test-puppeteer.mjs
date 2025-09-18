import puppeteer from 'puppeteer';

async function testPuppeteer() {
  console.log('Testing Puppeteer...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
    });
    
    console.log('✅ Browser launched successfully');
    
    const page = await browser.newPage();
    console.log('✅ Page created successfully');
    
    await page.setContent('<html><body><h1>Test PDF</h1></body></html>');
    console.log('✅ Content set successfully');
    
    const pdf = await page.pdf({ format: 'A4' });
    console.log('✅ PDF generated successfully, size:', pdf.length, 'bytes');
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    console.log('🎉 Puppeteer test completed successfully!');
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error);
    process.exit(1);
  }
}

testPuppeteer();
