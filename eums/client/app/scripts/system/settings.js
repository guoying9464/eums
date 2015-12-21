'use strict';

angular.module('SystemSettings', ['eums.config', 'User', 'SystemSettingsService', 'Loader', 'frapontillo.bootstrap-switch', 'ngToast'])
    .config(['ngToastProvider', function (ngToast) {
        ngToast.configure({maxNumber: 1, horizontalPosition: 'center'});
    }])
    .controller('SystemSettingsController', function ($scope, $timeout, UserService, SystemSettingsService, LoaderService, ngToast) {

            var isCancelledOrInitUpdated = false;

            $scope.settings = {};
            $scope.isSelected = false;
            $scope.onText = 'ON';
            $scope.offText = 'OFF';
            $scope.isActive = true;
            $scope.size = 'normal';
            $scope.animate = true;
            $scope.radioOff = true;
            $scope.handleWidth = "auto";
            $scope.labelWidth = "auto";
            $scope.inverse = true;

            $scope.isON = false;
            $scope.settings.syncStartDate = null;

            SystemSettingsService.getSettings().then(function (settings) {
                $scope.settings.syncStartDate = settings.sync_start_date;
                $scope.isSelected = settings.state;
                isCancelledOrInitUpdated = settings.state;
            });

            $scope.$watch('settings', function (newValue, oldValue) {
                if (newValue.syncStartDate !== oldValue.syncStartDate) {
                    processSyncStartDate(newValue.syncStartDate, oldValue.syncStartDate);
                }
            }, true);

            $('input[name="auto-track-switch"]').on('switchChange.bootstrapSwitch', function (event, state) {
                $timeout(function () {
                    if (isCancelledOrInitUpdated) {
                        isCancelledOrInitUpdated = false;
                        return;
                    }
                    $scope.isON = state;
                    LoaderService.showModal("auto-track-confirm-modal");
                });
            });

            $scope.cancelAutoTrack = function () {
                LoaderService.hideModal("auto-track-confirm-modal");
                isCancelledOrInitUpdated = true;
                $scope.isSelected = !$scope.isSelected;
            };

            $scope.confirmAutoTrack = function () {
                var updated_status = $scope.isSelected;
                SystemSettingsService.updateSettings({auto_track: updated_status}).then(function () {
                    LoaderService.hideModal("auto-track-confirm-modal");
                });
            };

            function processSyncStartDate(newDate, oldDate) {
                if (oldDate === null || new Date(newDate) < new Date(oldDate)) {
                    $scope.settings.syncStartDate = newDate;
                    SystemSettingsService.updateSettings({sync_start_date: newDate});
                } else {
                    $scope.settings.syncStartDate = oldDate;
                    var errorMessage = "You can only set an earlier date";
                    ngToast.create({content: errorMessage, class: 'danger'});
                }
            }
        }
    );
