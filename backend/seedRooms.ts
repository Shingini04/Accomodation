import { AppDataSource } from "./src/data-source";
import { Room } from "./src/entities/Room";

async function seedRooms() {
  await AppDataSource.initialize();
  console.log("Database initialized");

  const roomRepo = AppDataSource.getRepository(Room);

  // Clear existing rooms
  const existingRooms = await roomRepo.find();
  if (existingRooms.length > 0) {
    await roomRepo.remove(existingRooms);
    console.log("Cleared existing rooms");
  }

  const hostels = [
    { name: "Sharavati", prefix: "SH", rooms: 20, capacity: 4 },
    { name: "Narmada", prefix: "NA", rooms: 15, capacity: 3 },
    { name: "Alaknanda", prefix: "AL", rooms: 18, capacity: 4 },
    { name: "Mandakini", prefix: "MA", rooms: 12, capacity: 3 },
  ];

  const rooms = [];

  for (const hostel of hostels) {
    for (let i = 1; i <= hostel.rooms; i++) {
      const roomNumber = `${hostel.prefix}${String(i).padStart(3, '0')}`;
      const occupied = Math.floor(Math.random() * (hostel.capacity + 1)); // Random occupancy
      
      const room = roomRepo.create({
        roomNumber: roomNumber,
        hostelName: hostel.name,
        roomType: hostel.capacity === 4 ? "4-bed" : "3-bed",
        capacity: hostel.capacity,
        occupied: occupied,
        available: occupied < hostel.capacity,
      });
      
      rooms.push(room);
    }
  }

  await roomRepo.save(rooms);
  console.log(`✅ Created ${rooms.length} rooms across ${hostels.length} hostels`);
  
  for (const hostel of hostels) {
    const hostelRooms = rooms.filter(r => r.hostelName === hostel.name);
    const totalCapacity = hostelRooms.reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupied = hostelRooms.reduce((sum, r) => sum + r.occupied, 0);
    console.log(`   ${hostel.name}: ${hostelRooms.length} rooms, ${totalOccupied}/${totalCapacity} occupied`);
  }
  
  await AppDataSource.destroy();
}

seedRooms().catch(console.error);
