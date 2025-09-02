import bcrypt from 'bcrypt';

const password = 'testpassword123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Password hash:', hash);
  
  // Test the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error comparing password:', err);
      return;
    }
    console.log('Password verification:', result);
  });
});
