from app.database.session import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.company import Company
from app.models.contact import Contact
from app.models.assignment import Assignment
from app.models.notification import Notification

def seed_db():
    # Make sure tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Users
        admin = db.query(User).filter(User.email == "admin@crm.com").first()
        if not admin:
            admin = User(
                name="Admin User",
                email="admin@crm.com",
                password=get_password_hash("adminpassword"),
                role="admin"
            )
            db.add(admin)
            print("Seeded admin user.")

        emp1 = db.query(User).filter(User.email == "employee1@crm.com").first()
        if not emp1:
            emp1 = User(
                name="Employee One",
                email="employee1@crm.com",
                password=get_password_hash("employeepassword"),
                role="employee"
            )
            db.add(emp1)
            print("Seeded employee 1.")

        emp2 = db.query(User).filter(User.email == "employee2@crm.com").first()
        if not emp2:
            emp2 = User(
                name="Employee Two",
                email="employee2@crm.com",
                password=get_password_hash("employeepassword"),
                role="employee"
            )
            db.add(emp2)
            print("Seeded employee 2.")

        db.commit()
        # Fetch fresh references
        admin = db.query(User).filter(User.email == "admin@crm.com").first()
        emp1 = db.query(User).filter(User.email == "employee1@crm.com").first()
        emp2 = db.query(User).filter(User.email == "employee2@crm.com").first()

        # 2. Seed Companies
        techcorp = db.query(Company).filter(Company.name == "TechCorp").first()
        if not techcorp:
            techcorp = Company(
                name="TechCorp",
                industry="Technology",
                address="123 Tech Lane",
                phone="123-456-7890"
            )
            db.add(techcorp)
            print("Seeded TechCorp.")

        healthmed = db.query(Company).filter(Company.name == "HealthMed").first()
        if not healthmed:
            healthmed = Company(
                name="HealthMed",
                industry="Healthcare",
                address="456 Care Blvd",
                phone="234-567-8901"
            )
            db.add(healthmed)
            print("Seeded HealthMed.")

        financeplus = db.query(Company).filter(Company.name == "FinancePlus").first()
        if not financeplus:
            financeplus = Company(
                name="FinancePlus",
                industry="Finance",
                address="789 Wall St",
                phone="345-678-9012"
            )
            db.add(financeplus)
            print("Seeded FinancePlus.")

        db.commit()
        # Fetch fresh references
        techcorp = db.query(Company).filter(Company.name == "TechCorp").first()
        healthmed = db.query(Company).filter(Company.name == "HealthMed").first()
        financeplus = db.query(Company).filter(Company.name == "FinancePlus").first()

        # 3. Seed Contacts
        john = db.query(Contact).filter(Contact.email == "john@techcorp.com").first()
        if not john:
            john = Contact(
                company_id=techcorp.id,
                name="John Doe",
                email="john@techcorp.com",
                phone="123-456-7891",
                designation="Tech Lead"
            )
            db.add(john)
            print("Seeded John Doe.")

        jane = db.query(Contact).filter(Contact.email == "jane@techcorp.com").first()
        if not jane:
            jane = Contact(
                company_id=techcorp.id,
                name="Jane Smith",
                email="jane@techcorp.com",
                phone="123-456-7892",
                designation="Product Manager"
            )
            db.add(jane)
            print("Seeded Jane Smith.")

        alice = db.query(Contact).filter(Contact.email == "alice@healthmed.com").first()
        if not alice:
            alice = Contact(
                company_id=healthmed.id,
                name="Alice Johnson",
                email="alice@healthmed.com",
                phone="234-567-8902",
                designation="Clinic Director"
            )
            db.add(alice)
            print("Seeded Alice Johnson.")

        bob = db.query(Contact).filter(Contact.email == "bob@healthmed.com").first()
        if not bob:
            bob = Contact(
                company_id=healthmed.id,
                name="Bob Brown",
                email="bob@healthmed.com",
                phone="234-567-8903",
                designation="Lead Surgeon"
            )
            db.add(bob)
            print("Seeded Bob Brown.")

        charlie = db.query(Contact).filter(Contact.email == "charlie@financeplus.com").first()
        if not charlie:
            charlie = Contact(
                company_id=financeplus.id,
                name="Charlie Davis",
                email="charlie@financeplus.com",
                phone="345-678-9013",
                designation="Financial Advisor"
            )
            db.add(charlie)
            print("Seeded Charlie Davis.")

        db.commit()
        # Fetch fresh references
        john = db.query(Contact).filter(Contact.email == "john@techcorp.com").first()

        # 4. Seed Assignments
        assignment1 = db.query(Assignment).filter(Assignment.user_id == emp1.id, Assignment.company_id == techcorp.id).first()
        if not assignment1:
            assignment1 = Assignment(
                user_id=emp1.id,
                company_id=techcorp.id,
                contact_id=None,
                role="Account Manager",
                assigned_by=admin.id
            )
            db.add(assignment1)
            print("Seeded Assignment: Employee 1 to TechCorp.")

        assignment2 = db.query(Assignment).filter(Assignment.user_id == emp2.id, Assignment.contact_id == john.id).first()
        if not assignment2:
            assignment2 = Assignment(
                user_id=emp2.id,
                company_id=None,
                contact_id=john.id,
                role="Support Lead",
                assigned_by=admin.id
            )
            db.add(assignment2)
            print("Seeded Assignment: Employee 2 to John Doe.")

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
