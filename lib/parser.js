class Parser {
    _conditions;
    _semi_parsed_conditions;
    _level;
    _max_level;

    constructor() {
        this._semi_parsed_conditions = {};
        this._level = 1;
        this._max_level = 1;
    }

    parseWhere(conditions) {
        let semi_parsed = this.parseConditions(conditions);
        let condition_string = this.arrayToString(semi_parsed);
        let level_template = this.nestLevels();
        let final_query_conitions = '';
        
        for (let lvl = 1; lvl <= this._max_level; lvl++) {
            final_query_conitions = level_template.replace('#'+lvl+'#', condition_string['l'+lvl]);
        }
        
        return final_query_conitions;
    }

    parseConditions(conditions) {
        conditions.forEach(condition => {
            if (condition.hasOwnProperty('relation')) {
                this._semi_parsed_conditions['_' + this._level] = {
                    relation: condition.relation,
                    level: this._level
                };
                this._level = this._level + 1;
                this._max_level = this._level;
                this.parseConditions(condition.cond);
            } else {
                this.readStatement(condition);
                this._level = this._level - 1;
            }
        });
    }

    readStatement(condition){
        let condition_string = condition.col + ' ' + condition.op + ' ' + condition.val;
        if (this._semi_parsed_conditions.hasOwnProperty('_' + this._level)) {
            if (this._semi_parsed_conditions['_' + this._level].hasOwnProperty('cond_str')) {
                this._semi_parsed_conditions['_' + this._level].cond_str.push(condition_string);
            } else {
                this._semi_parsed_conditions['_' + this._level].cond_str = [condition_string];
            }
        }
    }

    arrayToString(semi_parsed){
        let condition_string = {};
        for (let lvl = 1; lvl <= this._max_level; lvl++) {
            let relation = semi_parsed['l' + lvl].relation; 
            let condition_counter = 1;
            condition_string['l' + lvl] = '';
            semi_parsed['l' + lvl].cond_str.forEach(cond => {
                condition_string['l' + lvl] += cond;
                if(condition_counter < semi_parsed['l' + lvl].cond_str.length)
                    condition_string += ' ' + relation + ' '
                
                condition_counter++;
            });
        }

        return condition_string;
    }


    nestLevels(level_template = '', level = 1){
        level_template += '(';
        level_template += '#' + level + '#';
        if(level < this._max_level)
            this.nestLevels(level_template, level + 1);
        level_template += ')';

        return level_template;
    }
}

module.exports = Parser;