const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const axios = require('axios');
const pool = require('../db');

// Passport strategija
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/oauth/callback'
  },
  async function(accessToken, refreshToken, params, done) {
    try {
      // Dohvaćanje korisničkog profila od Google-a
      const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const profile = response.data;

      // Provjera da li korisnik postoji u bazi
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email]);

      let user;
      if (rows.length === 0) {
        // Ako korisnik ne postoji, kreirajte novog
        const insertQuery = `
          INSERT INTO users (email, first_name, last_name, role, password)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `;
        const values = [
          profile.email,
          profile.given_name || 'Unknown', // Koristite `given_name` za ime
          profile.family_name || 'Unknown', // Koristite `family_name` za prezime
          'user', // Defaultna uloga za Google korisnike
          'Google_OAuth' // Defaultna lozinka za korisnike koji koriste Google OAuth
        ];
        const newUserResult = await pool.query(insertQuery, values);
        user = newUserResult.rows[0];
        console.log('Created New User:', user);
      } else {
        // Korisnik već postoji
        user = rows[0];
        console.log('Existing User:', user);
      }

      // Proslijedite korisnika Passport-u
      return done(null, user);

    } catch (error) {
      console.error('Error fetching Google profile or handling user:', error);
      return done(error);
    }
  }
));

// Serializacija korisnika
passport.serializeUser((user, done) => {
    done(null, user.user_id); // Pohranjujemo korisnikov ID u sesiju
});

// Deserializacija korisnika
passport.deserializeUser(async (id, done) => {
  try {
      if (!id) {
          // Ako ID ne postoji, vraćamo null korisnika
          return done(null, null);
      }

      const { rows } = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
      const user = rows[0];

      if (!user) {
          return done(null, null);
      }

      done(null, user);
  } catch (error) {
      console.error('Error during deserialization:', error);
      done(error, null);
  }
});
