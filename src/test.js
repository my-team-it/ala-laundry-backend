import washingService from "./services/washingService.js";

async function test(washing_id) {
    const key1 = "is_door_open_"+1;
    const value1 = 1;
    console.log({key: value})
    washingService.updateIsDoorOpenByID(washing_id, {key1: value1})

    const key2 = "is_door_open_"+2;
    const value2 = 0;
    console.log({key: value})
    washingService.updateIsDoorOpenByID(washing_id, {key2: value2})
    
    const key3 = "is_door_open_"+3;
    const value3 = 1;
    console.log({key: value})
    washingService.updateIsDoorOpenByID(washing_id, {key3: value3})

    const isDoorOpenList = washingService.readIsDoorOpenStatesByID(washing_id);
    console.log(isDoorOpenList)
    const isDoorClosedOnAllChecks = isDoorOpenList.every(status => !status);
    console.log(isDoorClosedOnAllChecks)
}

export default {
    test
}