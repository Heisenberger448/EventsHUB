-- Drop existing foreign key constraint
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organizationId_fkey";

-- Add foreign key constraint with CASCADE delete
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;
