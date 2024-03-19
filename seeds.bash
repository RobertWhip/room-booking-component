# Create a new user
user=$(curl -s --location --request POST 'http://localhost:3000/users' --header 'Content-Type: application/json' -d '{ "name": "best user" }')

# Extract the uuid using jq
user_uuid=$(echo "$user" | jq -r '.uuid')
echo "Created user $user_uuid"

# Create a new room with time slots for the newly created user
room=$(curl -s --location --request POST 'http://localhost:3000/rooms' \
    --header 'Content-Type: application/json' \
    -d '{
        "name": "A House on the Hill",
        "userUuid": "'"$user_uuid"'",
        "timeSlots": [
            {
            "startDateTime": "2024-03-20T15:00:00.000Z",
            "endDateTime": "2024-03-20T16:00:00.000Z",
            "roomUuid": "123e4567-e89b-12d3-a456-426614174000"
            },
            {
            "startDateTime": "2024-03-20T11:00:00.000Z",
            "endDateTime": "2024-03-20T12:00:00.000Z",
            "roomUuid": "123e4567-e89b-12d3-a456-426614174000"
            }
        ]
    }')

# Extracting created uuids
room_uuid=$(echo "$room" | jq -r '.uuid')
first_time_slot_uuid=$(echo "$room" | jq -r '.timeSlots[0].uuid')
echo "Created Room: $room_uuid"
echo "Created Time Slot[0]: $first_time_slot_uuid"

# Book the room
booking=$(curl -s --location --request POST 'http://localhost:3000/bookings' \
--header 'Content-Type: application/json' \
--data-raw '{
    "roomUuid": "'"$room_uuid"'",
    "userUuid": "'"$user_uuid"'",
    "timeSlotUuids": ["'"$first_time_slot_uuid"'"]

}')
booking_uuid=$(echo "$room" | jq -r '.uuid')
echo "Created Booking: $booking_uuid"