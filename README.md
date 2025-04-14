# Human Resource Management
This is a web app designed to simplify the recruitment and candidate selection process, aswell as manage internal employee data efficiently. This application enables efficient management of job postings, candidate screening, ranking, and communication with applicants throughout the selection process.
The system provides different functionalities for administrators (HR managers) and candidates (regular users), ensuring a simple and transparent application process.
## Installation
- Before u start, u will need Node.js (v22.11.0) and PostgreSQL Server installed on your PC.
- git clone https://github.com/harun20035/HRM-Project.git
- cd HRM-Project
- npm install
- Make a database with this command: psql -U postgres -d hrm_system -f hrm_system.sql (or full path to this file)
## Setup and Start
- You will need to make your .env file with your information
- After you complete and install everything, you should be able to start a project with this command: node server.js
## Testing
You can register as a user and search for job or you can change default role in code and register as admin or super-admin (to do that go to the controllers folder and authController.js file, and in this piece of code:
   const result = await pool.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, first_name, last_name, 'user']
        );) just change the string 'user' to 'admin' or 'super-admin' and then register on the page.
