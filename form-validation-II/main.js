function Validator(formSelector) {
    const formElement = document.querySelector(formSelector);

    function findAncestor(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Quy tắc xử lý rules:
    // Không lỗi trả về undefined
    // Lỗi trả về message
    const validatorRules = {
        required(value) {
            return value ? undefined : 'Vui lòng nhập vào trường này'
        },
        email(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'  
        },
        min(min) {
            return function(value) {
                return value.length >= min ? undefined : `Phải tối thiểu ${min} ký tự`
            }
        },
        max(max) {
            return function(value) {
                return value.length <= max ? undefined : `Phải tối đa ${max} ký tự`
            }
        },
    }
    
    if(formElement) {
        const formRules = {}
        const inputElements = formElement.querySelectorAll('[name][rules]')

        for (const inputElement of inputElements) {
            const rules = inputElement.getAttribute('rules').split('|');
            for(const rule of rules) {
                let ruleFunc = validatorRules[rule]

                if(rule.includes(':')) {
                    const ruleInfo = rule.split(':')
                    ruleFunc= validatorRules[ruleInfo[0]](ruleInfo[1])
                }
                
                if(Array.isArray(formRules[inputElement.name])) {
                    formRules[inputElement.name].push(ruleFunc)
                } else {
                    formRules[inputElement.name] = [ruleFunc]
                }
            }

            // Lăng nghe và xử lý validate
            // Lắng nghe blur
            inputElement.onblur = handleValidate;
            // Lắng nghe onchange
             inputElement.oninput = clearErrorMessage;
        }

        // Xử lý các xự kiện trong input
        function handleValidate(e) {
            const rules = formRules[e.target.name]
            let errorMessage;
            
            rules.some(function(rule){
                return errorMessage = rule(e.target.value);
            })

            if(errorMessage) {
                const ancestorElement = findAncestor(e.target, '.form-group')
                ancestorElement.classList.add('invalid')
                ancestorElement.querySelector('.form-message').innerText = errorMessage
            }
        }

        // Xóa tin nhắn lỗi khi nhập vào
        function clearErrorMessage(e) {
            if(e.target.value) {
                const ancestorElement = findAncestor(e.target, '.form-group')

                if(ancestorElement.classList.contains('invalid')) {
                    ancestorElement.classList.remove('invalid')
                    ancestorElement.querySelector('.form-message').innerText = ''
                }
            }
        }
    }   

    const _this = this;
    
    formElement.onsubmit = function(e) {
        e.preventDefault();

        let isValid = true;
        const inputElements = formElement.querySelectorAll('[name][rules]')
        for(const inputElement of inputElements) {
            handleValidate({
                target: inputElement,
            })
            if(!inputElement.value) {
                isValid = false;
            }
        }
        if(isValid) {
            const dataValues = Array.from(inputElements).reduce(function(values, input) {
                switch(input.type) {
                    case 'radio':
                        if(input.matches(':checked')) {
                            values[input.name] = input.value
                        }
                        break;
                    case 'checkbox':
                        if(input.matches(':checked')) {
                            if(Array.isArray( values[input.name])) {
                                values[input.name].push(input.value)
                            } else {
                                values[input.name] = [input.value]
                            }
                            }
                        break;
                    case 'file':
                        values[input.name] = input.files;
                        console.log([input])
                        break;
                    default:
                        values[input.name] = input.value
                }
                    return values;
                },{})


                _this.onSubmit(dataValues)
        } else {
            formElement.submit();   
        }
    }
}