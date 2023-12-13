from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json, redis, json, requests, uvicorn
from fastapi import Request
from redis.lock import Lock

REDIS_URL = "redis://:default@localhost:6379?db=0"
BUS_STOPS = {
    "Manyata Entrance": (13.0431284,77.6210554),
    "Target(Opp Dockyard)": (13.0469848,77.6209442),
    "Escape(Opp CTS)": (13.050317, 77.621865),
    "Nokia": (13.050625, 77.620225),
    "IBM": (13.049319, 77.619491),
    "Rolls Royce(Opp Nokia)": (13.046008, 77.619710)
}
API_KEY = "szWaDI43XhM9NcsnwBoURp4vYkDaDQIo"

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# ---------------------------------------------------------------------------------------------------------------------------------------------------
# Put the 
# ---------------------------------------------------------------------------------------------------------------------------------------------------
@app.put("/location/")
async def root(request:Request, bus_id: int = Query(0, description="Bus ID")):
    try:
        client = redis.StrictRedis.from_url(REDIS_URL)
        data = await request.json()
        lock = Lock(client, 'scheduler_lock') # To avoid multiple process accessing the shared redis instance.
        with lock:
            client.set(f"{bus_id}", json.dumps(data["data"]))
    except Exception as error:
        print(f"Storing the location in the redis{error}")
    else:
        client.close()
        print("Data is sent to cache")
        return {"message": "Data is sent to cache"}






# ---------------------------------------------------------------------------------------------------------------------------------------------------
# Get Estimate of the distance and time from the selected the Bus Stop
# ---------------------------------------------------------------------------------------------------------------------------------------------------
@app.get("/get_estimate/")
async def get_estimate(bus_stop: str):

    client = redis.StrictRedis.from_url(REDIS_URL)
    lock = Lock(client, 'scheduler_lock') # To avoid multiple process accessing the shared redis instance.
    all_keys = client.keys("*")

    # Iterate through each key, retrieve data, and delete the key
    data_for_keys = {}
    for key in all_keys:
        data_for_keys[key.decode('utf-8')] = json.loads(client.get(key).decode('utf-8'))
        client.delete(key)

    location_details = {}
    for bus_location in data_for_keys:
        origin = str(data_for_keys[bus_location]['latitude']) + "," + str(data_for_keys[bus_location]['longitude'])
        destination = str(BUS_STOPS[bus_stop][0]) + "," + str(BUS_STOPS[bus_stop][1])

        try:
            DISTANCE_CALCULATOR_URL = f"https://api.tomtom.com/routing/1/calculateRoute/{origin}:{destination}/json?travelMode=bus"
            headers = {"Content-type": "application/json",}
            data = {"supportingPoints": [], }
            response = requests.post(DISTANCE_CALCULATOR_URL, headers=headers, json=data, params={"key": API_KEY})
            response = response.json()
            distance = str(response['routes'][0]['summary']['lengthInMeters']) + "m"
            timetaken = divmod(response['routes'][0]['summary']['travelTimeInSeconds'], 60)
            location_details[bus_location] = {"distance": distance, "time": str(timetaken[0]) + "min " + str(timetaken[1]) + "s"}
        except Exception as e:
            print("Error in caclulating distance -", e)
            location_details[bus_location] = {"distance": "NA", "time": "NA"}
    else:
        client.close()
        return location_details




# ---------------------------------------------------------------------------------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------------------------------------------------------------------------------
def main():
    uvicorn.run("main:app", host="127.0.0.1", port=9999, reload=True)


# Entry point for running the FastAPI app
if __name__ == "__main__":
    main()


# import redis
# import time
# from redis.exceptions import LockNotOwnedError

# client = redis.StrictRedis(host='localhost', port=6379, db=0)

# def process_key_with_lock(key):
#     lock_key = f"{key}_lock"

#     # Acquire the lock
#     lock = client.lock(lock_key, timeout=10)
#     acquired = lock.acquire(blocking=True)

#     try:
#         if acquired:
#             # Process the key while holding the lock
#             data = client.get(key)
#             if data:
#                 data_string = data.decode('utf-8')
#                 print(f"Processing data: {data_string}")
#                 # Your processing logic here

#             # Delete the key after processing
#             client.delete(key)
#         else:
#             print(f"Failed to acquire the lock for key: {key}")
#     finally:
#         # Release the lock only if it was acquired
#         if acquired:
#             try:
#                 lock.release()
#             except LockNotOwnedError:
#                 print("LockNotOwnedError: Cannot release a lock that's no longer owned.")

# # Replace 'your_key' with the actual key you want to process
# process_key_with_lock('your_key')