
#include "stdafx.h"

#include <alljoyn/BusAttachment.h>
#include <alljoyn/DBusStd.h>
#include <alljoyn/AllJoynStd.h>
#include <alljoyn/BusObject.h>
#include <alljoyn/MsgArg.h>
#include <alljoyn/version.h>
#include <alljoyn/Status.h>
#include <qcc/Log.h> 

using namespace System;
using namespace ajn;
using namespace Gardener;

const char* APP_NAME = "App";
const char* SERVICE_NAME = "com.akvelon.gardener";
const char* INTERFACE_NAME = "com.akvelon.gardener";
const char* SERVICE_PATH = "/flowerpot";
bool ALLOW_REMOTE_MESSAGES = true;
const SessionPort SERVICE_PORT = 1001;


class BasicSampleObject : public BusObject {
public:
	BasicSampleObject(BusAttachment& bus, const char* path) :
		BusObject(path)
	{
		/** Add the test interface to this object */
		const InterfaceDescription* exampleIntf = bus.GetInterface(INTERFACE_NAME);
		assert(exampleIntf);
		AddInterface(*exampleIntf);

		/** Register the method handlers with the object */
		const MethodEntry methodEntries[] = {
			{ exampleIntf->GetMember("paramValue"), static_cast<MessageReceiver::MethodHandler>(&BasicSampleObject::Cat) }
		};
		QStatus status = AddMethodHandlers(methodEntries, sizeof(methodEntries) / sizeof(methodEntries[0]));
		if (ER_OK != status) {
			printf("Failed to register method handlers for BasicSampleObject.\n");
		}
	}

	void ObjectRegistered()
	{
		BusObject::ObjectRegistered();
		printf("ObjectRegistered has been called.\n");
	}


	void Cat(const InterfaceDescription::Member* member, Message& msg)
	{
		/* Concatenate the two input strings and reply with the result. */
		qcc::String inStr1 = msg->GetArg(0)->v_string.str;
		qcc::String inStr2 = msg->GetArg(1)->v_string.str;
		qcc::String outStr = inStr1 + inStr2;

		MsgArg outArg("s", outStr.c_str());
		QStatus status = MethodReply(msg, &outArg, 1);
		if (ER_OK != status) {
			printf("Ping: Error sending reply.\n");
		}
	}
};

class MyBusListener : public BusListener, public SessionPortListener {
	void NameOwnerChanged(const char* busName, const char* previousOwner, const char* newOwner)
	{
		if (newOwner && (0 == strcmp(busName, SERVICE_NAME))) {
			printf("NameOwnerChanged: name=%s, oldOwner=%s, newOwner=%s.\n",
				busName,
				previousOwner ? previousOwner : "<none>",
				newOwner ? newOwner : "<none>");
		}
	}
	bool AcceptSessionJoiner(SessionPort sessionPort, const char* joiner, const SessionOpts& opts)
	{
		if (sessionPort != SERVICE_PORT) {
			printf("Rejecting join attempt on unexpected session port %d.\n", sessionPort);
			return false;
		}
		printf("Accepting join session request from %s (opts.proximity=%x, opts.traffic=%x, opts.transports=%x).\n",
			joiner, opts.proximity, opts.traffic, opts.transports);
		return true;
	}
};

/** The bus listener object. */
static MyBusListener s_busListener;

/** Top level message bus object. */
static BusAttachment* s_msgBus = NULL;

/** Create the interface, report the result to stdout, and return the result status. */
QStatus CreateInterface(void)
{
	/* Add org.alljoyn.Bus.method_sample interface */
	InterfaceDescription* testIntf = NULL;
	QStatus status = s_msgBus->CreateInterface(INTERFACE_NAME, testIntf);

	if (status == ER_OK) {
		printf("Interface created.\n");
		testIntf->AddMethod("paramValue", "", "", "", 0);
		testIntf->Activate();
	}
	else {
		printf("Failed to create interface '%s'.\n", INTERFACE_NAME);
	}

	return status;
}

/** Register the bus object and connect, report the result to stdout, and return the status code. */
QStatus RegisterBusObject(BasicSampleObject* obj)
{
	QStatus status = s_msgBus->RegisterBusObject(*obj);

	if (ER_OK == status) {
		printf("RegisterBusObject succeeded.\n");
	}
	else {
		printf("RegisterBusObject failed (%s).\n", QCC_StatusText(status));
	}

	return status;
}

/** Connect, report the result to stdout, and return the status code. */
QStatus ConnectBusAttachment(void)
{
	QStatus status = s_msgBus->Connect();

	if (ER_OK == status) {
		printf("Connect to '%s' succeeded.\n", s_msgBus->GetConnectSpec().c_str());
	}
	else {
		printf("Failed to connect to '%s' (%s).\n", s_msgBus->GetConnectSpec().c_str(), QCC_StatusText(status));
	}

	return status;
}

/** Start the message bus, report the result to stdout, and return the status code. */
QStatus StartMessageBus(void)
{
	QStatus status = s_msgBus->Start();

	if (ER_OK == status) {
		printf("BusAttachment started.\n");
	}
	else {
		printf("Start of BusAttachment failed (%s).\n", QCC_StatusText(status));
	}

	return status;
}

/** Create the session, report the result to stdout, and return the status code. */
QStatus CreateSession(TransportMask mask)
{
	SessionOpts opts(SessionOpts::TRAFFIC_MESSAGES, false, SessionOpts::PROXIMITY_ANY, mask);
	SessionPort sp = SERVICE_PORT;
	QStatus status = s_msgBus->BindSessionPort(sp, opts, s_busListener);

	if (ER_OK == status) {
		printf("BindSessionPort succeeded.\n");
	}
	else {
		printf("BindSessionPort failed (%s).\n", QCC_StatusText(status));
	}

	return status;
}

/** Advertise the service name, report the result to stdout, and return the status code. */
QStatus AdvertiseName(TransportMask mask)
{
	QStatus status = s_msgBus->AdvertiseName(SERVICE_NAME, mask);

	if (ER_OK == status) {
		printf("Advertisement of the service name '%s' succeeded.\n", SERVICE_NAME);
	}
	else {
		printf("Failed to advertise name '%s' (%s).\n", SERVICE_NAME, QCC_StatusText(status));
	}

	return status;
}

/** Request the service name, report the result to stdout, and return the status code. */
QStatus RequestName(void)
{
	const uint32_t flags = DBUS_NAME_FLAG_REPLACE_EXISTING | DBUS_NAME_FLAG_DO_NOT_QUEUE;
	QStatus status = s_msgBus->RequestName(SERVICE_NAME, flags);

	if (ER_OK == status) {
		printf("RequestName('%s') succeeded.\n", SERVICE_NAME);
	}
	else {
		printf("RequestName('%s') failed (status=%s).\n", SERVICE_NAME, QCC_StatusText(status));
	}

	return status;
}

namespace Akvelon { 
	namespace Gardener {
		namespace Service {

			public ref class GardenerService : IDisposable
			{
			private:
	/*			ajn::BusAttachment *ajBusAttachment;

				MyBusListener* s_busListener;*/


				void startAllJoynService() 
				{

					QCC_UseOSLogging(false);
					QCC_SetLogLevels("ALLJOYN=1");

					printf("AllJoyn Library version: %s.\n", ajn::GetVersion());
					printf("AllJoyn Library build info: %s.\n", ajn::GetBuildInfo());

					QStatus status = ER_OK;

					/* Create message bus */
					s_msgBus = new BusAttachment("myApp", true);

					if (!s_msgBus) {
						status = ER_OUT_OF_MEMORY;
					}

					if (ER_OK == status) {
						status = CreateInterface();
					}

					if (ER_OK == status) {
						s_msgBus->RegisterBusListener(s_busListener);
					}

					if (ER_OK == status) {
						status = StartMessageBus();
					}

					BasicSampleObject testObj(*s_msgBus, SERVICE_PATH);

					if (ER_OK == status) {
						status = RegisterBusObject(&testObj);
					}

					if (ER_OK == status) {
						status = ConnectBusAttachment();
					}

					/*
					* Advertise this service on the bus.
					* There are three steps to advertising this service on the bus.
					* 1) Request a well-known name that will be used by the client to discover
					*    this service.
					* 2) Create a session.
					* 3) Advertise the well-known name.
					*/
					if (ER_OK == status) {
						status = RequestName();
					}

					const TransportMask SERVICE_TRANSPORT_TYPE = TRANSPORT_ANY;

					if (ER_OK == status) {
						status = CreateSession(SERVICE_TRANSPORT_TYPE);
					}

					if (ER_OK == status) {
						status = AdvertiseName(SERVICE_TRANSPORT_TYPE);
					}
				}

			public:
				GardenerService(IGardenerDevice ^device) 
				{
					startAllJoynService();
				}

				~GardenerService() 
				{
					//delete ajBusAttachment;
					//ajBusAttachment = NULL;
				}
			};
		}
	}
}