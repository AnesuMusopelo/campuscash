# Campus Cash Student Demo

A mobile-first static demo of the **student side** of Campus Cash.

## Included screens
- Login / signup
- Home dashboard
- Loan application
- Loan status tracking
- Wallet
- Repayment flow
- Profile / feature overview

## Demo interactions
- Log in or sign up
- Select a loan amount and submit an application
- See approval and status updates
- Simulate wallet disbursement
- Simulate repayment
- Data is stored in browser localStorage for demo continuity

## Deploy on GitHub Pages
1. Create a public GitHub repository
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md`
3. Go to **Settings > Pages**
4. Choose **Deploy from a branch**
5. Select your main branch and `/ (root)`
6. Save and wait for the `github.io` link

## Reset demo data
Open the browser console and run:
```js
localStorage.removeItem('campusCashStudentDemo')
```
