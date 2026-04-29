import sources from '../sources.json' with {type: 'json'};

const limits = {
    pollution: 0,
    efficiency: 0,
}

sources.map(source => {
    limits.pollution = limits.pollution + source.pollution;
    limits.efficiency = limits.efficiency  + source.efficiency;
})

sources.map(source => {
    
})