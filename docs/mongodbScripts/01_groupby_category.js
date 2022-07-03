
var aggregatePipeline= [
    {$match:{$or:[{type:'INCOME'},{type:'EXPENSE'}]}},
    {$group:{
        //se agrupo por multiples atributos
        _id:{type:'$type',category:'$category'},//referencia de lo que vamos a utilizar, el campo category
        count: {$sum:1},//atributo count indicando que va hacer en cada documento, contando 1 por 1
        amount: {$sum:'$amount'}//contarnos 4 por 4
    
    }},
    {$project:{
        _id:1,
        count:1,
        amount:15
    }},
    
{
    $sort:{
        //'_id':1 
        //si no quiero el id que me devuelva el amount o prom
        '_id.type':1, 
        'amount':-1
    }
}//definir un arreglo


];

db.cashFlow.aggregate(aggregatePipeline);





//$match para establecer filtros, todos los doc de filtro cuyo valor sera type
// $group permite agrupar que devolvio match por ejemplo expenses agrupado
// $projection es para devolver de lo que sigue ciertos campos especificos