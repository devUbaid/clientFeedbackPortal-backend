import bcryptjs from 'bcryptjs';

const password = '@admin2025'; // The plaintext password you want to hash

bcryptjs.hash(password, 10).then(hash => {
  console.log('Hashed Password:', hash);
}).catch(err => console.error(err));
