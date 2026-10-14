# Prio 19ツ — Supabase সেটআপ (বাংলা)

## ১) Supabase project তৈরি
1. https://supabase.com খুলুন এবং লগইন করুন।
2. New project চাপুন; শক্তিশালী database password দিন এবং নিরাপদে রাখুন।
3. Project তৈরি হলে Project URL ও Publishable key (অথবা legacy anon/public key) সংগ্রহ করুন।
4. service_role/secret key কখনো website-এর HTML/JS-এ দেবেন না।

## ২) Database টেবিল তৈরি
1. Supabase project → SQL Editor খুলুন।
2. GitHub-এর supabase-schema.sql ফাইল খুলে সম্পূর্ণ কোড কপি করুন।
3. SQL Editor-এ paste করে Run চাপুন।

## ৩) নিরাপদ অ্যাডমিন account
1. Supabase → Authentication → Users → Add user থেকে নিজের email দিয়ে user তৈরি করুন।
2. তৈরি হওয়া user-এর ID কপি করুন।
3. SQL Editor-এ এই SQL চালান; USER-UUID-এর জায়গায় user ID বসাবেন:

    insert into public.profiles(user_id,role)
    values ('USER-UUID','admin')
    on conflict(user_id) do update set role='admin';

4. পাসওয়ার্ড কাউকে দেবেন না। Public sign-up দরকার নেই।

## ৪) গুরুত্বপূর্ণ বর্তমান অবস্থা
GitHub-এর বর্তমান admin.html/admin.js এখনো LocalStorage demo—এটি secure login নয় এবং বাস্তব order/database পরিচালনা করে না। Database schema প্রস্তুত করার পর Admin page-কে Supabase Auth-এ যুক্ত করতে হবে, তারপর মূল দোকানের product list ও checkout-কে database-এ যুক্ত করতে হবে। এই সংযোগ শেষ না হওয়া পর্যন্ত live customer orders নেওয়ার জন্য এটি ব্যবহার করবেন না।

নিরাপত্তা: শুধু front-end-এ password check করা নিরাপদ নয়। Supabase Auth + Row Level Security এবং server-side price/stock validation প্রয়োজন। bKash/Nagad payment পরে gateway integration-এর মাধ্যমে যোগ করা যাবে।