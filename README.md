### HACKABOARD

Its Hackaboard , Collaborative White/black board for your personal or maybe fun use .
More features to come so stay alert .

Here is the instructions for Dev and freaks:- 

```sh
git clone https://github.com/yashhh999/hackaboard.git 
```

Must star the repo fellas

```sh
npm i

cd hackaboard
```
Install the dependencies and Change to that directory
and setup the database .

Create an `.env` and paste this and change the value to your database link .

```js
DATABASE_URL="postgresql DB Url"
```

Setup Database 

```sh
npx prisma generate 

npx prisma db push

```
Now start the server 

```sh
npm run dev 
```

Server should be started in `http://localhost:3000`

or, For production build
```sh
npm run build
```
and 
```sh
npm run start
```
