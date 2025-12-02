const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Deploy to Production\n');

rl.question('📝 Commit message: ', (message) => {
  const commitMsg = message.trim() || 'Content update';
  
  try {
    console.log('\n📦 Adding all changes...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('💾 Committing...');
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    
    console.log('📤 Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('🚢 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    
    console.log('\n✅ Deployment complete! 🎉\n');
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
});