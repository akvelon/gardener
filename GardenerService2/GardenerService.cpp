
#include "stdafx.h"


using namespace System;
using namespace System::Threading;
using namespace Gardener;

extern void startAllJoynService();

namespace Akvelon { 
	namespace Gardener {
		namespace Service {

			public ref class GardenerService
			{
			private:
	/*			ajn::BusAttachment *ajBusAttachment;

				MyBusListener* s_busListener;*/


				

			public:
				GardenerService(IGardenerDevice ^device) 
				{
					startAllJoynService();
					//Thread^ t = gcnew Thread(gcnew ThreadStart(this, &GardenerService::startAllJoynService));
					//t->Start();

					
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