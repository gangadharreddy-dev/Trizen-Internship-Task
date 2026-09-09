import os
from datetime import datetime, timezone, timedelta
from app.database import Base, engine, SessionLocal
from app.models.user import User, UserRole
from app.models.event import Event, EventMember
from app.models.photo import Photo
from app.models.gallery import Gallery, GalleryPhoto
from app.auth.security import get_password_hash, hash_pin
from app.config import settings

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("🌱 Seeding PhotoShare database...")

        # 1. Admin User
        admin_email = "admin@photoshare.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Alex Rivera (Lead Admin)",
                email=admin_email,
                password_hash=get_password_hash("AdminPassword123!"),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"✅ Created Admin: {admin.email}")

        # 2. Team Member: Rahul Sharma (from prototype)
        rahul_email = "rahul@photoshare.com"
        rahul = db.query(User).filter(User.email == rahul_email).first()
        if not rahul:
            rahul = User(
                name="Rahul Sharma",
                email=rahul_email,
                password_hash=get_password_hash("TeamPassword123!"),
                role=UserRole.TEAM_MEMBER
            )
            db.add(rahul)
            db.commit()
            db.refresh(rahul)
            print(f"✅ Created Team Member: {rahul.email}")

        # 3. Suresh Kumar & Kiran Patel (from prototype)
        for name, email in [("Suresh Kumar", "suresh@photoshare.com"), ("Kiran Patel", "kiran@photoshare.com"), ("Sam Morgan", "sam@photoshare.com")]:
            existing = db.query(User).filter(User.email == email).first()
            if not existing:
                u = User(
                    name=name,
                    email=email,
                    password_hash=get_password_hash("TeamPassword123!"),
                    role=UserRole.TEAM_MEMBER
                )
                db.add(u)
                db.commit()
                print(f"✅ Created Team Member: {email}")

        # 4. Sample Event: "Arjun & Priya Wedding"
        event = db.query(Event).filter(Event.name == "Arjun & Priya Wedding").first()
        if not event:
            event = Event(
                name="Arjun & Priya Wedding",
                description="Luxury celebration at Grand Palace Hotel featuring traditional ceremonies, drone shots, and candid evening reception.",
                created_by=admin.id,
                event_date=datetime.now(timezone.utc) + timedelta(days=5)
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            print(f"✅ Created Event: {event.name} (ID: {event.id})")

        # 5. Assign Team Members to Event
        team_members_list = [rahul]
        for member_user in team_members_list:
            existing_member = db.query(EventMember).filter(
                EventMember.event_id == event.id,
                EventMember.user_id == member_user.id
            ).first()
            if not existing_member:
                db.add(EventMember(event_id=event.id, user_id=member_user.id))
                db.commit()
                print(f"✅ Assigned {member_user.name} to {event.name}")

        # 6. Sample Photos (Using curated high-res Unsplash photography links)
        sample_photos_data = [
            ("Bride & Groom Sunset Portrait", "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80", rahul.id, True),
            ("Ceremony Ring Exchange", "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80", rahul.id, True),
            ("Grand Entrance Candid", "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80", rahul.id, True),
            ("Floral Arch Backdrop", "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80", rahul.id, True),
            ("First Dance Under Lanterns", "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1200&q=80", rahul.id, True),
            ("Wedding Cake Cutting", "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&q=80", rahul.id, False),
            ("Reception Table Setup", "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80", rahul.id, False),
            ("Guests Champagne Toast", "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200&q=80", rahul.id, False)
        ]

        photos = []
        for filename, url, uploader_id, is_sel in sample_photos_data:
            existing_photo = db.query(Photo).filter(
                Photo.event_id == event.id,
                Photo.filename == filename
            ).first()
            if not existing_photo:
                p = Photo(
                    event_id=event.id,
                    uploaded_by=uploader_id,
                    filename=f"{filename}.jpg",
                    storage_location=url,
                    file_size=2048576,
                    is_selected=is_sel
                )
                db.add(p)
                db.commit()
                db.refresh(p)
                photos.append(p)
            else:
                photos.append(existing_photo)

        print(f"✅ Verified {len(photos)} photos for {event.name}")

        # 7. Published Gallery with demo token "abc123" and PIN "482917"
        gallery = db.query(Gallery).filter(Gallery.event_id == event.id).first()
        if not gallery:
            gallery = Gallery(
                event_id=event.id,
                public_token="abc123",
                pin_hash=hash_pin("482917"),
                published=True
            )
            db.add(gallery)
            db.commit()
            db.refresh(gallery)

            # Link selected photos into gallery_photos
            for p in photos:
                if p.is_selected:
                    db.add(GalleryPhoto(gallery_id=gallery.id, photo_id=p.id))
            db.commit()
            print("✅ Created and Published Demo Gallery: /gallery/abc123 with PIN: 482917")

        print("🎉 Database successfully seeded!")
        print("-" * 50)
        print("Demo Credentials:")
        print("Admin:       admin@photoshare.com / AdminPassword123!")
        print("Team Member: sam@photoshare.com   / TeamPassword123!")
        print("Demo Gallery URL: /gallery/abc123")
        print("Demo Gallery PIN: 482917")
        print("-" * 50)

    finally:
        db.close()

if __name__ == "__main__":
    seed()
