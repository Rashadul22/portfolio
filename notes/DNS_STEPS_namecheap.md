# Move rashadul.me from Vercel to GitHub Pages (5 minutes, Namecheap)

The site is already published on GitHub Pages (repo Rashadul22/rashadul22.github.io, commit 62d9c34) and answers
for rashadul.me. Only the domain's DNS still points to Vercel (which is blocked, 402).

1. Log in at namecheap.com -> Domain List -> rashadul.me -> **Manage** -> tab **Advanced DNS**.
2. Delete the old Vercel records: the A record `@ -> 76.76.21.21` and the CNAME `www -> cname.vercel-dns.com`.
3. Add four A records (Host `@`, TTL Automatic):
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
4. Add one CNAME record: Host `www` -> Value `rashadul22.github.io.`
5. Save. Wait 10-60 minutes. Then open https://rashadul.me
6. After it works: github.com/Rashadul22/rashadul22.github.io -> Settings -> Pages -> tick **Enforce HTTPS**
   (it may take up to a day for the certificate; until then use http://rashadul.me).

Later, if Vercel is unblocked, nothing breaks: Vercel is simply no longer used.
