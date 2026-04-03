-- Check all verification codes in database
SELECT 
  id,
  type,
  "userId",
  "expiresAt",
  "createdAt",
  CASE 
    WHEN "expiresAt" > NOW() THEN '✅ Valid'
    ELSE '❌ Expired'
  END as status,
  EXTRACT(EPOCH FROM ("expiresAt" - NOW()))/60 as minutes_until_expiry
FROM "VerificationCode" 
WHERE type IN ('MagicLogin', 'MagicRegister')
ORDER BY "createdAt" DESC
LIMIT 20;

-- Check specific code (replace with your code)
-- SELECT * FROM "VerificationCode" WHERE id = 'your-code-here';
