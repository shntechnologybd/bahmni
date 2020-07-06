'use strict';

Bahmni.ObservationForm = function (formUuid, user, formName, formVersion, observations, extension) {
    var self = this;
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var init = function () {
        self.formUuid = formUuid;
        self.formVersion = formVersion;
        self.formName = formName;
        self.label = formName;
        self.conceptName = formName;
        self.collapseInnerSections = {value: false};
        self.alwaysShow = user.isFavouriteObsTemplate(self.conceptName);
        self.observations = [];
        _.each(observations, function (observation) {
            var observationFormField = observation.formFieldPath ? (observation.formFieldPath.split("/")[0]).split('.') : null;
            if (observationFormField && observationFormField[0] === formName && observationFormField[1] === formVersion) {
                self.observations.push(observation);
            }
        });
        self.isOpen = self.observations.length > 0;
        self.id = "concept-set-" + formUuid;
        self.options = extension ? (extension.extensionParams || {}) : {};
    };

    self.toggleDisplay = function () {
        if (self.isOpen) {
            hide();
        } else {
            show();
        }
    };

    function hide () {
        self.isOpen = false;
    }

    function show () {
        self.isOpen = true;
    }

    // parameters added to show in observation page :: START
    self.clone = function () {
        var clonedObservationFormSection = new Bahmni.ObservationForm(self.formUuid, user, self.formName, self.formVersion, []);
        clonedObservationFormSection.isOpen = true;
        return clonedObservationFormSection;
    };

    self.isAvailable = function (context) {
        return true;
    };

    self.formValidation = function (context, conceptSet) {
        //var today = new Date();
        // for age calculation
        // var dob = new Date(context.patient.birthdate);
        // var timeDiff = Math.abs(today.getTime() - dob.getTime());
        // var age = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;
        var dob = new Date(context.patient.birthdate);
        var today = dateUtil.now();
        var timeDiff = dateUtil.diffInYearsMonthsDays(dob, today);
        var age = (timeDiff.years * 365) + (timeDiff.months * 30) + timeDiff.days;

        var gender = context.patient.gender;

        // for LMP date calculation
        if (context.patient.LMP) {
            var lmpDate = new Date(context.patient.LMP);
            var timeDiffForLmp = Math.abs(today.getTime() - lmpDate.getTime());
            var LmpDayDifference = Math.ceil(timeDiffForLmp / (1000 * 3600 * 24)) - 1;
        }

        // for form name extraction
        var formName = conceptSet.formName;
        var findSpecialIndex = formName.indexOf("_");
        if (findSpecialIndex != -1) {
            var splitFormName = formName.split("_");
            formName = splitFormName[0];
        }

        // for delivery day calculation
        var deliveryDayDifference = "";
        if (typeof context.patient.Delivery_Date !== "undefined") {
            var deliveryDate = new Date(context.patient.Delivery_Date.value);
            var timeDiffDelivery = dateUtil.diffInYearsMonthsDays(deliveryDate, today);
            deliveryDayDifference = (timeDiffDelivery.years * 365) + (timeDiffDelivery.months * 30) + timeDiffDelivery.days;
            // var deliveryDateDifference = Math.abs(today.getTime() - deliveryDate.getTime());
            // deliveryDayDifference = Math.ceil(deliveryDateDifference / (1000 * 3600 * 24)) - 1;
        }

        // Checking marital status
        var maritalStatus = "";
        if (typeof context.patient.MaritalStatus !== "undefined") {
            maritalStatus = context.patient.MaritalStatus.value.uuid;
        }

        // checking pregnancy status
        var pregnancyStatus = "";

        if (typeof context.patient.PregnancyStatus !== "undefined") {
            pregnancyStatus = context.patient.PregnancyStatus.value;
        }

        var married = 'ecc59681-a133-4f9a-998d-e45429dbdfd7';

        if (age <= Bahmni.Common.Constants.lessThanTwoMonths && formName == Bahmni.Common.Constants.lessTwoMonthsFormName) {
            return true;
        } else if (age > Bahmni.Common.Constants.lessThanTwoMonths && age <= Bahmni.Common.Constants.zeroToFiveYearsInDay && formName == Bahmni.Common.Constants.lessThanFiveYearsChildrenFormName) {
            return true;
        } else if (age > Bahmni.Common.Constants.moreThanElevenYears && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.obstetricFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanElevenYears && age <= Bahmni.Common.Constants.FourtyNineYearsInDay  && gender == Bahmni.Common.Constants.female && pregnancyStatus == "Pregnancy Enrollment" && formName == Bahmni.Common.Constants.antenatalFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanElevenYears && age <= Bahmni.Common.Constants.FourtyNineYearsInDay  && gender == Bahmni.Common.Constants.female && pregnancyStatus == "Post-Partum Enrollment" && deliveryDayDifference <= Bahmni.Common.Constants.postnatalFormDeliveryDayCondition &&  formName == Bahmni.Common.Constants.postnatalFormName) {
            return true;
        } else if (age <= Bahmni.Common.Constants.lessThanFortyTwoDays && formName == Bahmni.Common.Constants.lessThanFortyTwoDaysFormName) {
            return true;
        } else if (age <= Bahmni.Common.Constants.zeroToFiveYearsInDay && formName == Bahmni.Common.Constants.childVaccinationFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanFifteenYears && age <= Bahmni.Common.Constants.FourtyNineYearsInDay && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.womenVaccinationFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanElevenYears && age <= Bahmni.Common.Constants.FourtyNineYearsInDay && formName == Bahmni.Common.Constants.familyPlanningFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanElevenYears && age <= Bahmni.Common.Constants.FourtyNineYearsInDay && formName == Bahmni.Common.Constants.stiRtiFormName) {
            return true;
        } else if (age >= Bahmni.Common.Constants.moreThanElevenYears && age <= Bahmni.Common.Constants.zeroToNineteenYearsInDay && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.adolescentFormName) {
            return true;
        } else if (age > Bahmni.Common.Constants.moreThanElevenYears && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.cervicalCancerFormName) {
            return true;
        } else if (age > Bahmni.Common.Constants.moreThanElevenYears && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.deliveryFormName) {
            return true;
        } else if (age > Bahmni.Common.Constants.moreThanElevenYears && gender == Bahmni.Common.Constants.female && formName == Bahmni.Common.Constants.pacsFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.clientHistoryFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.generalFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.generalVaccinationFormName) {
            return true;
        } else if (formName == 'Limited Curative Care') {
            return true;
        } else if (formName == 'First Aid') {
            return true;
        } else if (formName == Bahmni.Common.Constants.eyeCareFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.dischargeCertificateFormName && context.visitType == "IPD") {
            return true;
        } else if (formName == Bahmni.Common.Constants.inwardReferralFomrName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.outwardReferralFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.followupFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.tbCaseFindingFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.tbDotsFormName) {
            return true;
        } else if (formName == Bahmni.Common.Constants.tbVerbalScreening) {
            return true;
        } else if (formName == Bahmni.Common.Constants.adverseEventForm) {
            return true;
        }


            // else if (pregnancyStatus == "প্রসব পূর্ব" && (formName == Bahmni.Common.Constants.antenatalFormName)) {
        //     return true;
        // } else if (deliveryDayDifference <= Bahmni.Common.Constants.postnatalFormDeliveryDayCondition && pregnancyStatus == "প্রসবোত্তর" && formName == Bahmni.Common.Constants.postnatalFormName) {
        //     return true;
        // }
        //     return true;
        // }
        // } else if (pregnancyStatus == antenatal && (formName == Bahmni.Common.Constants.antenatalFormName)) {
        //     return true;
        // } else if (deliveryDayDifference <= Bahmni.Common.Constants.postnatalFormDeliveryDayCondition && pregnancyStatus == postnatal && formName == Bahmni.Common.Constants.postnatalFormName) {
        //     return true;
        // } else if (formName == Bahmni.Common.Constants.generalDiseaseFormName && age >= Bahmni.Common.Constants.moreThanFiveYearInDay) {
        //     return true;
        // } else if (formName == Bahmni.Common.Constants.pregnantStatusFormName && gender == Bahmni.Common.Constants.female && maritalStatus == married) {
        //     if (deliveryDayDifference == "") {
        //         return true;
        //     } else if (deliveryDayDifference >= Bahmni.Common.Constants.pregnantStatusFormDeliveryDayCondition) {
        //         return true;
        //     }
        // } else if (gender == Bahmni.Common.Constants.male && maritalStatus == married && formName == Bahmni.Common.Constants.familyPlaningFormName) {
        //     return true;
        // } else if (pregnancyStatus != antenatal && gender == Bahmni.Common.Constants.female && maritalStatus == married && age <= Bahmni.Common.Constants.fiftyYearInDay && formName == Bahmni.Common.Constants.familyPlaningFormName) {
        //     return true;
        // } else if (age >= Bahmni.Common.Constants.TwoMonthInDay && age <= Bahmni.Common.Constants.twoMonthToFiveYearInDay && formName == Bahmni.Common.Constants.growthMonitoringFormName) {
        //     return true;
        // }
        else {
            return false;
        }
    };

    self.show = function () {
        self.isOpen = true;
        self.isLoaded = true;
    };

    self.toggle = function () {
        self.added = !self.added;
        if (self.added) {
            self.show();
        }
    };

    self.hasSomeValue = function () {
        var observations = self.getObservationsForConceptSection();
        return _.some(observations, function (observation) {
            return atLeastOneValueSet(observation);
        });
    };

    self.getObservationsForConceptSection = function () {
        return self.observations.filter(function (observation) {
            return observation.formFieldPath.split('.')[0] === self.formName;
        });
    };

    var atLeastOneValueSet = function (observation) {
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            return observation.groupMembers.some(function (groupMember) {
                return atLeastOneValueSet(groupMember);
            });
        } else {
            return !(_.isUndefined(observation.value) || observation.value === "");
        }
    };

    self.isDefault = function () {
        return false;
    };

    Object.defineProperty(self, "isAdded", {
        get: function () {
            if (self.hasSomeValue()) {
                self.added = true;
            }
            return self.added;
        },
        set: function (value) {
            self.added = value;
        }
    });

    self.maximizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: false};
    };

    self.minimizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: true};
    };

    // parameters added to show in observation page :: END

    init();
};
