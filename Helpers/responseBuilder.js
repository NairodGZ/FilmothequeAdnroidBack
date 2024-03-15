


    function responseBuilder(response, code, message, data)
    {
       return response.json({code : code, message : message, data : data})
    }

    



module.exports = responseBuilder