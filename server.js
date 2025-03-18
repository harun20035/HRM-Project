const express = require('express');
const app = express();
const dotenv = require('dotenv');
const pool = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

require('./config/passport-setup');

app.use(session({
  secret: 'tajna',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser()); 

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.set('view engine', 'ejs');
app.set('views', './views');

const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const commentRoutes = require('./routes/comments');
const interviewRoutes = require('./routes/interviews');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes = require('./routes/profile');
const applicationsStatusRoutes = require('./routes/applicationsStatus');
const bestCandidatesRoutes = require('./routes/bestCandidates');
const chatRoutes = require('./routes/chat');

app.use('/', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applicationsStatus', applicationsStatusRoutes);
app.use('/api/bestCandidates', bestCandidatesRoutes);
app.use('/api/chat', chatRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
