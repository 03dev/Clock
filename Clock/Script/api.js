class API{
    async getData(continent){
        let url = "http://worldtimeapi.org/api/timezone";
        const data = await fetch(`${url}/${continent}`);
        const jsonData = await data.json();
        return {
            jsonData
        }
    }

    async getTime(continent, area){
        let url = "http://worldtimeapi.org/api/timezone/";
        const data = await fetch(`${url}/${continent}/${area}`)
        const jsonData = await data.json();
        return {
            jsonData
        }
    }

    async firstInitalize(timezone){
        let url = "http://worldtimeapi.org/api/timezone/";
        const data = await fetch(`${url}/${timezone}`)
        const jsonData = await data.json();
        return {
            jsonData
        }
    }
}