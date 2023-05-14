// Đối tượng Validator
function Validator(options) {
    // Chứa tất cả các rule của selectors
    let selectorRules = {}
    // Lấy element của form
    const formElement = document.querySelector(options.form)
    
    function getOutElement(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        const messageElement = getOutElement(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        let errorMessage;

        // Lấy ra các rule của selectors
        const rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        // Dừng lặp nếu có lỗi
        for(let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked'
                        ))
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage)    break;
        }

        if(errorMessage) { 
            messageElement.innerText = errorMessage
            getOutElement(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            messageElement.innerText = ''
            getOutElement(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }


    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            let isValidForm = true
            // Kiểm tra tất cả các input đã nhập chưa khi submit 
            options.rules.forEach(function(rule) {
                const inputElement = formElement.querySelector(rule.selector)
                
                const isValid = validate(inputElement, rule)
                if(!isValid) {
                    isValidForm = false
                }
            })

            if(isValidForm) {
                if(typeof options.onSubmit === 'function') {
                    const inputElement = formElement.querySelectorAll('[name]:not([disabled])')

                    const dataValues = Array.from(inputElement).reduce(function(values, input) {
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

                    options.onSubmit(dataValues)
                } else {
                    formElement.submit();
                }
            } else {

            }
        }   
    }
    
    // Lặp qua mỗi rule và xử lý sự kiện
    options.rules.forEach(function (rule) {

        const inputElements = formElement.querySelectorAll(rule.selector)
        
        // Lưu tất cả rules của selector
        if(Array.isArray(selectorRules[rule.selector])){
            selectorRules[rule.selector].push(rule.test)
        }   else {
            selectorRules[rule.selector] = [rule.test]
        }

        Array.from(inputElements).forEach(function(inputElement) {
            // Báo lỗi khi blur ra ngoài
            inputElement.onblur = function () {
                validate(inputElement, rule);
            }

            // Xóa lỗi khi nhập lại thẻ input
            inputElement.oninput = function() {
                const messageElement = getOutElement(inputElement, options.formGroupSelector).querySelector('.form-message')

                messageElement.innerText = ''
                getOutElement(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
        })
    })
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi: trả ra message lỗi
// 2. Khi không co lỗi: không trả ra gì cả (undefined)
Validator.isRequired = function(selector, message) {
    return {
        selector,
        test(value) {
            return value ? undefined : message || 'Vui lòng nhập vào trường này'
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.isPassword = function(selector, min, message) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : message || 'Mật khẩu phải lớn hơn 6 kí tự'
        }
    }
}

Validator.isConfirmed = function(selector, valueConfirmed, message) {
    return {
        selector,
        test(value) {
            return value === valueConfirmed() ? undefined : message || 'Thông tin xác nhận không đúng'
        }
    }
}