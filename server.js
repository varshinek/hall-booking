const express = require("express")
const app = express()
const port = 3000;

// userdate = "2024-07-13"
// usertime = "20:22:00"
// const date = `${userdate} ${usertime}`;
// console.log(`date ${date}`)
// const parse = Date.parse(date)
// console.log(`parse ${parse}`)

const rooms = [
    {
        room_name:"Room #1",
        seates_available:"50",
        aminities:"AC,WIFI,TV",
        price:"200$",
    },
    {
        room_name:"Room #2",
        seates_available:"50",
        aminities:"WIFI,TV",
        price:"150$",
    },
    {
        room_name:"Room #3",
        seates_available:"50",
        aminities:"WIFI",
        price:"100$",
    }
]

const booked_rooms = [];
const booked_customer = [];
const total_booking_data =[];

app.get("/get-rooms",(req,res)=>{
    res.json(rooms)
})

app.post("/add-room",(req,res)=>{
    const room_name = req.query.room_name;
    const seates_available = req.query.seates_available;
    const aminities = req.query.aminities;
    const price = req.query.price
    let check = 0;

    //Check for empty values
    if(!room_name || !seates_available || !aminities || !price){
        return res.json({message:"Fields should not empty"})
    }

    //Check for existance of the room_name in rooms
    rooms.map((room)=>{
        if(room.room_name == room_name){
            check++
            return res.json({message:`Same room name detected please change room_name - ${room_name}`})
        }
    })

    //Will add the new room deatails if its not already exisited
    if(check==0){
        const new_room = {
            room_name,
            seates_available,
            aminities,
            price : `${price}$`,
        }
    
        rooms.push(new_room);
        res.json({message:"Added new room successfully",new_room})
    }
})

app.get("/all-booked-rooms",(req,res)=>{
    res.json(booked_rooms)
})

app.post("/book-room", (req,res)=> {
    const room_name = req.query.room_name;
    const customer_name = req.query.customer_name;
    const date = req.query.date;
    const start_time = req.query.start_time;
    const end_time = req.query.end_time;

    //Check for values is not null
    if(!room_name){
        return res.json({message:"Room Name needed"})
    }

    if(!customer_name || !date || !start_time || !end_time){
        return res.json({message:"Fields should not be empty",customer_name,date,start_time,end_time})
    }

    //Filter the booked room data checking for its availability 
    const check_status = booked_rooms.filter((room)=>room.room_name == room_name && room.date == date)

    rooms.map((room)=>{
        if(room.room_name == room_name){

            //If no booked rooms in that room_name and date we proceed to book that room for customer_name
            if(booked_rooms.length == 0 || check_status.length == 0){

                const booked_room_data = {
                    room_name,
                    customer_name,
                    date,
                    start_time,
                    end_time,
                    booked_satus:"booked"
                }
                booked_rooms.push(booked_room_data);

                const total_customer_data = {
                    customer_name,
                    room_name,
                    date,
                    start_time,
                    end_time,
                    booking_id : total_booking_data.length +1,
                    booking_data : new Date(),
                    booking_status : "booked"
                }
                total_booking_data.push(total_customer_data)

                const booked_customer_data = {
                    customer_name,
                    room_name,
                    date,
                    start_time,
                    end_time
                }
                booked_customer.push(booked_customer_data);
            }

            //If we got same room_name and date already booked then we proceed to check for its time availability
            else {
                let temp_count = 0;
                const user_start_time = `${date} ${start_time}`;
                const user_end_time = `${date} ${end_time}`;

                const booked_start_time_parse = Date.parse(user_start_time);
                const booked_end_time_parse = Date.parse(user_end_time);

                check_status.map((room)=>{
                    const date_check = room.date
                    const check_start_time = `${date_check} ${room.start_time}`;
                    const check_end_time = `${date_check} ${room.end_time}`;

                    const room_start_time_parse = Date.parse(check_start_time);
                    const room_end_time_parse = Date.parse(check_end_time);

                    //Condition to check the users timing - start_time and end_time not same as already booked timings
                    if(booked_start_time_parse > room_end_time_parse || booked_end_time_parse < room_start_time_parse){
                        temp_count++
                    }
                })

                if(temp_count == check_status.length){
                    const booked_room_data = {
                        room_name,
                        customer_name,
                        date,
                        start_time,
                        end_time,
                        booked_satus:"booked"
                    }
                    booked_rooms.push(booked_room_data);
    
                    const total_customer_data = {
                        customer_name,
                        room_name,
                        date,
                        start_time,
                        end_time,
                        booking_id : total_booking_data.length +1,
                        booking_data : new Date(),
                        booking_status : "booked"
                    }
                    total_booking_data.push(total_customer_data)

                    const booked_customer_data = {
                        customer_name,
                        room_name,
                        date,
                        start_time,
                        end_time
                    }
                    booked_customer.push(booked_customer_data);
                }
                else {
                    return res.json({message:`Room not available for the given timing ${start_time} and ${end_time}`})
                }
            }
            return res.json({message:`Room available in this name - ${room_name} and booked successfully`})
        } 
    })
    res.json({message:`Room not available in this name - ${room_name}`})
})

app.get("/all-customers",(req,res)=> {
    res.json(booked_customer)
})

app.get("/booking-customer-data",(req,res)=> {
    const customer_name = req.query.customer_name;

    //Check for customer_name is not null
    if(!customer_name){
       return res.json({message:"Need specific customer name to display there booking details"})
    }

    //Filter the totalbooking data by customer_name
    const booking_customer_data = total_booking_data.filter((ele)=>ele.customer_name == customer_name)

    if(booking_customer_data.length==0){
        return res.json({message:`No customer found in name - ${customer_name}`})
    }
    res.json({total_bookings :booking_customer_data.length,booking_customer_data})
})

app.listen(port,()=>{
    console.log(`Node JS Running in localhost:${port}`)
})