https://emailer-psi-five.vercel.app/

Updated responder email:
https://emailer-psi-five.vercel.app/api/emailer?template=responder&lang=en&branded=true

Original responder email:
http://localhost:3000/api/emailer?template=responder&lang=en&original=true&branded=true

Styleguide:
https://emailer-psi-five.vercel.app/api/emailer?template=styleguide&lang=en&branded=true

## Environment Variables
You need to add the following two environment variables to a `.env` file in root of project to submit emails from localhost:
````
EMAIL_USER=emailAddressFromWhichEmailIsSent
EMAIL_PASS=AppPasswordForEmailAddress
````

## Run on Localhost
Project uses Node.js serverless functions run on Vercel. If you don't have Vercel CLI install it from terminal first:
````
pnpm i -g vercel
````

To run project on localhost:
````
git clone https://github.com/smohadjer/emailer.git
cd emailer
npm install
vercel dev
````
