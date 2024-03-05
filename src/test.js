import washingService from "./services/washingService.js";

async function test(washing_id) {
    const isDoorOpenList1 = await washingService.readIsDoorOpenStatesByID(washing_id);
    console.log(isDoorOpenList1);
    const isDoorClosedOnAllChecks1 = Object.values(isDoorOpenList1).every(status => !status);
    console.log(isDoorClosedOnAllChecks1);

    const key1 = "is_door_open_"+1;
    const value1 = 1;
    console.log({key1: value1});
    await washingService.updateIsDoorOpenByID(washing_id, {[key1]: value1});

    const key2 = "is_door_open_"+2;
    const value2 = 0;
    console.log({key2: value2});
    await washingService.updateIsDoorOpenByID(washing_id, {[key2]: value2});
    
    const key3 = "is_door_open_"+3;
    const value3 = 1;
    console.log({key3: value3});
    await washingService.updateIsDoorOpenByID(washing_id, {[key3]: value3});

    const isDoorOpenList = await washingService.readIsDoorOpenStatesByID(washing_id);
    console.log(isDoorOpenList);
    const isDoorClosedOnAllChecks = Object.values(isDoorOpenList).every(status => !status);
    console.log(isDoorClosedOnAllChecks);
}

export default {
    test
}