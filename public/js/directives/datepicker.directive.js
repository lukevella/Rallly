angular.module('rallly')
    .directive('datepicker', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                model: '=ngModel',
                control: '='
            },
            templateUrl: 'templates/directives/datePicker.html',
            link: function (scope, el, attrs, ngModel) {
                scope.model = scope.model || [];
                scope.control = scope.control || {};

                scope.$watch('model', function (newValue) {
                    ngModel.$setViewValue(newValue);
                    ngModel.$validate();
                }, true);

                ngModel.$validators.required = function (modelValue, viewValue) {
                    if (!modelValue || modelValue.length == 0) {
                        return false;
                    }
                    return true;
                };

                var today = moment().startOf('day'), activeDate = today.clone();
                var setMonth = function (toDate) {
                    activeDate = toDate;
                    var startDate = activeDate.clone().startOf('month'), // get first day of active month
                        startDateDOW = startDate.day(); // get day of the week for the active start date of the active month
                    // Set the startDate to the previous Sunday
                    if (startDateDOW == 0) {
                        startDate.add(-7, 'days');
                    } else {
                        startDate.add(startDateDOW * -1, 'days');
                    }
                    scope.title = activeDate.format('MMMM YYYY');
                    var days = new Array(42);
                    for (var i = 0; i < days.length; i++) {
                        var date = startDate.clone().add(i, 'days');
                        days[i] = {
                            date: date.toISOString(),
                            isOutsideMonth: (date.month() != activeDate.month()) ? true : false,
                            isToday: date.isSame(today)
                        }
                    }
                    scope.days = days;
                };
                setMonth(activeDate);
                scope.selectDay = function (dayObj) {
                    if (dayObj.isOutsideMonth) {
                        setMonth(dayObj.date);
                    }
                    if ((index = scope.isActive(dayObj.date, true)) != -1) {
                        // Already selected
                        scope.model.splice(index, 1); // remove
                    } else {
                        // Not selected
                        var index = 0, inserted = false;
                        do {
                            if (scope.model[index] == undefined || moment(scope.model[index].raw_date).isSame(moment(dayObj.date))) {
                                var dateObject = {
                                    raw_date: dayObj.date,
                                    possible_times: [{
                                        start_time: null,
                                        end_time: null
                                    }]
                                };
                                scope.model.splice(index, 0, dateObject);
                                inserted = true;
                            }
                            index++;
                        } while (inserted == false);
                    }
                };
                scope.isActive = function (date, returnIndex) {
                    date = moment(date);
                    scope.model = scope.model || [];
                    for (var i = 0; i < scope.model.length; i++) {
                        var modelDate = moment(scope.model[i].raw_date);
                        if (modelDate.date() === date.date() &&
                            modelDate.month() === date.month() &&
                            modelDate.year() === date.year()) {
                            return (returnIndex) ? i : true;
                        }
                    }
                    return (returnIndex) ? -1 : false;
                };
                scope.nextMonth = function () {
                    setMonth(activeDate.clone().add(1, 'months'));
                };
                scope.prevMonth = function () {
                    setMonth(activeDate.clone().add(-1, 'months'));
                };

                scope.control.removeDate = function (date) {
                    if ((index = scope.isActive(Date.parse(date.raw_date), true)) != -1) {
                        scope.model.splice(index, 1)
                    }
                }
            }
        }
    });
