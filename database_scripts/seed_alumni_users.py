import sys
import os

# Append backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from database import SessionLocal
import models
from auth import get_password_hash

alumni_users = [
    {"name": "NAGTILAK MEERA KALIDAS", "email": "meerakn83@gmail.com", "phone": "9518964169", "password": "meeran@123"},
    {"name": "DHAINJE REVATI VIJAY", "email": "revatidhainje31@gmail.com", "phone": "9075739438", "password": "revatid@123"},
    {"name": "KARANDE SMITA VITTHAL", "email": "smitakarande1999@gmail.com", "phone": "8149424459", "password": "smitak@123"},
    {"name": "JADHAV DIPTI VILAS", "email": "diptijadhav9890@gmail.com", "phone": "9284073194", "password": "diptij@123"},
    {"name": "ALEGAONKAR RANI VIJAY", "email": "raniva580@gmail.com", "phone": "9657969997", "password": "rania@123"},
    {"name": "WABALE SIDDHI PARESH", "email": "siddhi434work@gmail.com", "phone": "9763357434", "password": "siddhiw@123"},
    {"name": "WAD ANUPAMA SANJAY", "email": "anupama.wad@gmail.com", "phone": "8329368327", "password": "anupamaw@123"},
    {"name": "GOKHALE AISHWARYA ANAY", "email": "ashgokhalepune@gmail.com", "phone": "8767516029", "password": "aishwaryag@123"},
    {"name": "SHINDE ADARSH ASHISH", "email": "adarsh.shinde28@gmail.com", "phone": "9114282828", "password": "adarshs@123"},
    {"name": "ABHISHEK SURESH PATIL", "email": "abhishek71patil@gmail.com", "phone": "9623116148", "password": "abhishekp@123"},
    {"name": "NEELI SANKET SAIBABU", "email": "neelisanketkota@gmail.com", "phone": "9623973021", "password": "sanketn@123"},
    {"name": "CHAUDHARI CHETAN SATISH", "email": "vchetanchaudhari2223@gmail.com", "phone": "8380028799", "password": "chetanc@123"},
    {"name": "PALWE POOJA MANGESH", "email": "poojapalwe18@gmail.com", "phone": "9403620594", "password": "poojap@123"},
    {"name": "DAVE VINAY PRAVIN", "email": "vinaydave04@gmail.com", "phone": "8669029032", "password": "vinayd@123"},
    {"name": "NAVAID NISAR SAYYED", "email": "sayyednavaid716@gmail.com", "phone": "9011144768", "password": "navaids@123"},
    {"name": "DALVI SOURABH SACHIN", "email": "sourabhdalvi12@gmail.com", "phone": "9767720264", "password": "sourabhd@123"},
    {"name": "VIVEK DEVIDAS THAKAR", "email": "vivekdthakar99@gmail.com", "phone": "7030178385", "password": "vivekt@123"},
    {"name": "WALAMBE SHRUTI SACHIN", "email": "shrutiwalambe@gmail.com", "phone": "8407906585", "password": "shrutiw@123"},
    {"name": "PARDESHI ISHA DEEPAK", "email": "pardeshiisha28@gmail.com", "phone": "8983277882", "password": "ishap@123"},
    {"name": "SHINDE RUTUJA JAYSING", "email": "rutujajshinde111@gmail.com", "phone": "7083020755", "password": "rutujas@123"},
    {"name": "KAMBLE PRADNYA NAMDEV", "email": "pradnya.kamble@829gmail.com", "phone": "7620355044", "password": "pradnyak@123"},
    {"name": "GARDE SANCHITA SATISH", "email": "sanchitagarde1242@gamil.com", "phone": "8669262376", "password": "sanchitag@123"},
    {"name": "JAIN SHWETA SANMATI", "email": "shwe0601@gmail.com", "phone": "7499890082", "password": "shwetaj@123"},
    {"name": "SAGAR MARUTI PAWAR", "email": "sagarpawarsp1315@gmail.com", "phone": "9922551315", "password": "sagarp@123"},
    {"name": "ADAGALE SIMRAN RAJU", "email": "simranadagale20@gmail.com", "phone": "7249699857", "password": "simrana@123"},
    {"name": "GIRI MANISHA SANJAY", "email": "manishagiri2547@gmail.com", "phone": "9552751601", "password": "manishag@123"},
    {"name": "YADAV ANIKET PRAKASH", "email": "aniketyadav046@gmail.com", "phone": "8766959903", "password": "anikety@123"},
    {"name": "SALUNKHE SOHAN VIJAY", "email": "sohansalunkhe123@gmail.com", "phone": "9156137841", "password": "sohans@123"},
    {"name": "CHOUDHARI ATHARVA MOHAN", "email": "atharvachoudhari06@gmail.com", "phone": "9689295824", "password": "atharvac@123"},
    {"name": "VIPUL BHARGAV DESAI", "email": "vipulmdesai186@gmail.com", "phone": "9518741187", "password": "vipuld@123"},
    {"name": "MAHAMUNI AKSHATA VISHWANATH", "email": "akshatamahamuni24@gmail.com", "phone": "7776828954", "password": "akshatam@123"},
    {"name": "MANDHARE ADITYA UMESH", "email": "adityamandhare537@gmail.com", "phone": "8806808383", "password": "adityam@123"},
    {"name": "GOKHALE SAYLI SATISH", "email": "gokhalesayli18@gmail.com", "phone": "9503460247", "password": "saylig@123"}
]

def seed_alumni():
    db = SessionLocal()
    try:
        # 1. Ensure the 'alumni' role exists in the database
        role_name = "alumni"
        role = db.query(models.Role).filter(models.Role.role_name == role_name).first()
        if not role:
            print(f"Creating role: {role_name}")
            role = models.Role(
                role_name=role_name,
                description="Alumni role for placements and graduate relations"
            )
            db.add(role)
            db.flush()
        else:
            print(f"Role '{role_name}' already exists.")

        print(f"\n--- Seeding {len(alumni_users)} Alumni Users ---")
        
        inserted_count = 0
        updated_count = 0

        for user_data in alumni_users:
            email = user_data["email"].strip()
            name = user_data["name"].strip()
            phone = user_data["phone"].strip()
            password = user_data["password"].strip()
            
            # Generate a username from the email prefix (e.g. "meerakn83")
            username = email.split('@')[0]

            # Check if user already exists by email
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                # Also verify username uniqueness
                base_username = username
                counter = 1
                while db.query(models.User).filter(models.User.username == username).first():
                    username = f"{base_username}_{counter}"
                    counter += 1

                user = models.User(
                    username=username,
                    full_name=name,
                    email=email,
                    phone_number=phone,
                    password_hash=get_password_hash(password),
                    status=True
                )
                db.add(user)
                db.flush()
                inserted_count += 1
            else:
                # Update details if already exists
                user.full_name = name
                user.phone_number = phone
                user.password_hash = get_password_hash(password)
                user.status = True
                db.flush()
                updated_count += 1

            # Assign 'alumni' role to user if not already assigned
            user_role = db.query(models.UserRole).filter(
                models.UserRole.user_id == user.user_id,
                models.UserRole.role_id == role.role_id
            ).first()

            if not user_role:
                user_role = models.UserRole(user_id=user.user_id, role_id=role.role_id)
                db.add(user_role)
                
        db.commit()
        print(f"\n--- Seeding Complete: {inserted_count} inserted, {updated_count} updated ---")

    except Exception as e:
        print(f"Error seeding alumni users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_alumni()
