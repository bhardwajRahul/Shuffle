import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Billing from "../components/Billing.jsx";
import Priorities from "../components/Priorities.jsx";
import Branding from "../components/Branding.jsx";
import EditOrgTab from '../components/EditOrgTab.jsx';
import CloudSyncTab from '../components/CloudSyncTab.jsx';
import   SSOTab from "../components/ssoTab.jsx"
import { ToastContainer, toast } from "react-toastify";
import { Button, Tooltip } from '@mui/material';
import { getTheme } from '../theme.jsx';
import { Context } from '../context/ContextApi.jsx';
const OrganizationTab = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        userdata,
        globalUrl,
        serverside,
        isCloud,
        checkLogin,
        notifications,
        setNotifications,
        stripeKey, setSelectedOrganization,
        selectedStatus, setSelectedStatus,
        selectedOrganization, handleGetOrg, 
        handleStatusChange, handleEditOrg,
        isLoaded,
        removeCookie,
        isIntegrationPartner, isChildOrg,
        isGlobalUser
    } = props;

    const [selectedTab, setSelectedTab] = useState('org_config');
    const [organizationFeatures, setOrganizationFeatures] = useState({});
    const [billingInfo, setBillingInfo] = useState({});
    const [orgRequest, setOrgRequest] = React.useState(true);
    const [curIndex, setCurIndex] = React.useState(0);
    const items = ['Org Configuration', "SSO", "Notifications", 'Billing & Stats', 'Branding'];
    const [visibleTabs, setVisibleTabs] = useState(items);
    const [unreadNotifications, setUnreadNotifications] = React.useState(
        notifications?.filter((notification) => notification.read === false)?.length
    );

    const { themeMode, brandColor, brandName } = useContext(Context);
    const theme = getTheme(themeMode, brandColor); 


    useEffect(() => {
        if (isIntegrationPartner && isChildOrg && !isGlobalUser) {
            setVisibleTabs(items.filter((item) => item !== 'Branding' && item !== 'SSO'));
        }else {
            if (userdata && userdata.active_org && userdata.active_org.role === 'admin') {
                setVisibleTabs(items);
            }else {
                setVisibleTabs(items.filter((item) => item !== 'SSO'));
            }
        }
    },[isIntegrationPartner, isChildOrg, isGlobalUser, userdata]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tabName = queryParams.get('admin_tab');
        if (tabName) {
            const decodedTabName = decodeURIComponent(tabName);
            setSelectedTab(decodedTabName);
            if (decodedTabName === 'org_config') {
                setCurIndex(0);
            } else if(decodedTabName === 'sso'){
                setCurIndex(1)
            }else if (decodedTabName === 'notifications' || decodedTabName === 'priorities') {
                if (isIntegrationPartner && isChildOrg && !isGlobalUser) {
                    setCurIndex(1);
                }else {
                    if (userdata && userdata.active_org && userdata.active_org.role === 'admin') {
                        setCurIndex(2);
                    }else {
                        setCurIndex(1);
                    }
                }
            } else if (decodedTabName === 'billingstats' || decodedTabName === 'billing') {
                if (isIntegrationPartner && isChildOrg && !isGlobalUser) {
                    setCurIndex(2);
                } else {
                    if (userdata && userdata?.active_org && userdata?.active_org?.role === 'admin') {
                        setCurIndex(3);
                    } else {
                        setCurIndex(2);
                    }
                }
            } else if (decodedTabName === 'branding') {
                setCurIndex(4);
            }
            //  else if (decodedTabName === 'analytics') {
            //     setCurIndex(5);
            // }
        }
    }, [location.search]);

    const handleTabClick = (tabName) => {
        const formattedTabName = tabName.toLowerCase().replace(/[\s&]+/g, '');
        const encodedTabName = encodeURIComponent(formattedTabName);
        setSelectedTab(formattedTabName);
        document.title = brandName?.length > 0 ? `${brandName} - admin - ${formattedTabName}` : `Shuffle - admin - ${formattedTabName}`;
        navigate(`?admin_tab=${encodedTabName}`);
    };

    const handleNotifications = useCallback(() => {
        const unreadCount = notifications?.filter((notification) => notification.read === false).length;
        setUnreadNotifications(unreadCount);
    },[unreadNotifications,notifications]);

    useEffect(() => {
        if ((unreadNotifications !== notifications?.filter((notification) => notification.read === false).length) !== unreadNotifications) {
            handleNotifications();
        }
    }, [notifications]);

    const renderContent = () => {
        switch (selectedTab) {
            case 'org_config':
                return <EditOrgTab isCloud={isCloud} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} handleStatusChange={handleStatusChange} handleEditOrg={handleEditOrg} userdata={userdata} globalUrl={globalUrl} serverside={serverside} handleGetOrg={handleGetOrg} setSelectedOrganization={setSelectedOrganization} selectedOrganization={selectedOrganization} />;
            case 'sso': 
                return <SSOTab isEditOrgTab={true} globalUrl={globalUrl} isCloud={isCloud} userdata={userdata} handleEditOrg={handleEditOrg} selectedOrganization={selectedOrganization}/>
            case `notifications`:
            case `priorities`:
                return (
                    <Priorities
                        isCloud={isCloud}
                        userdata={userdata}
                        globalUrl={globalUrl}
                        checkLogin={checkLogin}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        clickedFromOrgTab={true}
                        serverside={serverside}
                        isLoaded={isLoaded}
                        selectedOrganization={selectedOrganization}
                        handleEditOrg={handleEditOrg}
                    />
                );
            case 'billingstats' :
            case 'billing' :
                return (
                    <Billing
                        isCloud={true}
                        userdata={userdata}
                        setSelectedOrganization={setSelectedOrganization}
                        globalUrl={globalUrl}
                        selectedOrganization={selectedOrganization}
                        billingInfo={billingInfo}
                        stripeKey={stripeKey}
                        handleGetOrg={handleGetOrg}
                        clickedFromOrgTab={true}
                        handleEditOrg={handleEditOrg}
                        removeCookie={removeCookie}
                        isLoaded={isLoaded}
                    />
                );
            case 'branding':
                return <Branding
                    isCloud={isCloud}
                    userdata={userdata}
                    globalUrl={globalUrl}
                    handleGetOrg={handleGetOrg}
                    selectedOrganization={selectedOrganization}
                    clickedFromOrgTab={true}
                    setSelectedOrganization={setSelectedOrganization}
                />;
            // case 'analytics':
            //     return <AnalyticsTab isCloud={isCloud} userdata={userdata} globalUrl={globalUrl} />;
            default:
                return <EditOrgTab isCloud={isCloud} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} handleStatusChange={handleStatusChange} handleEditOrg={handleEditOrg} userdata={userdata} globalUrl={globalUrl} serverside={serverside} handleGetOrg={handleGetOrg} setSelectedOrganization={setSelectedOrganization} selectedOrganization={selectedOrganization} />;
        }
    };
    

    return (
        <div style={{ height: "100%", width: "100%", color: theme.palette.platformColor, backgroundColor: theme.palette.platformColor, borderTopRightRadius: '8px', borderBottomRightRadius: 8, borderLeft: theme.palette.defaultBorder, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: "100%", borderBottom: theme.palette.defaultBorder ,boxSizing: 'border-box' }}>
                {visibleTabs.map((tabName, index) => (
                    <Tooltip
                        key={index}
                        title={
                            ((tabName === "sso")) && !(userdata?.support || userdata?.active_org?.role === "admin")
                            ? "Your role is not admin. Please ask the admin to change your role."
                            : ""
                        }
                        placement="right"
                    >
                        <div style={{ pointerEvents: 'auto', width: '100%',}}>
                            <Button
                                key={tabName}
                                onClick={() => {
                                    setCurIndex(index);
                                    handleTabClick(index === 0 ? "org_config" : tabName.toLowerCase().replace(/[\s&]+/g, ''));
                                }}
                                variant="text"
                                sx={{
                                    "&.MuiButton-root": {
                                        padding: '28px 0',
                                        borderBottom: index === curIndex ? `2px solid ${theme.palette.primary.main}`: 'none',
                                        cursor: 'pointer',
                                        fontWeight: index === curIndex ? 'bold' : 'normal',
                                        color: index === curIndex ? theme.palette.primary.main : theme.palette.text.primary,
                                        textTransform: 'none',
                                        fontSize: 16,
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 0,
                                    },
                                    "&: hover": {
                                        backgroundColor: theme.palette.hoverColor
                                    },
                                    "&.Mui-disabled": {
                                        color: "#6F6F6F",
                                    },
                                }}
                                disabled={
                                    ((tabName === "sso")) && !(userdata?.support || userdata?.active_org?.role === "admin")
                                }
                            >
                                {tabName.toLowerCase() === "notifications" && unreadNotifications > 0 ? (
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: -12,
                                            right: -15,
                                            width: 20,
                                            height: 20,
                                            borderRadius: 10,
                                            backgroundColor: theme.palette.primary.main,
                                            color: '#FFFFFF',
                                            fontSize: 12,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {unreadNotifications}
                                        </div>
                                        {tabName}
                                    </div>
                                ) : (
                                    <>{tabName}</>
                                )}
                            </Button>
                        </div>
                    </Tooltip>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: "100%", height: "100%", boxSizing:'border-box'}}>
                {renderContent()}
            </div>
        </div>
    );
};

export default OrganizationTab;
