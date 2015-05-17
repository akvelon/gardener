namespace MSOpenTech.AllJoyn
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Runtime.Serialization.Json;

    using BusAttachment = AllJoynUnity.AllJoyn.BusAttachment;
    using InterfaceDescription = AllJoynUnity.AllJoyn.InterfaceDescription;
    using ProxyBusObject = AllJoynUnity.AllJoyn.ProxyBusObject;

    internal static class Utils
    {

        /// <summary>
        /// Serializes any object to JSON string representation
        /// </summary>
        /// <param name="obj">object to serialize</param>
        /// <returns>JSON representation of the object. Returns 'null' string for null passed as argument</returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2202:Do not dispose objects multiple times")]
        internal static string Serialize(object obj)
        {
            if (obj == null)
            {
                return "null";
            }

            // Try to cast object to string and if cast succeds just return it
            // Otherwise proceed with serialization
            var s = obj as string;
            if (s != null)
            {
                return s;
            }

            string json;
            var serializer = new DataContractJsonSerializer(obj.GetType(),
                new DataContractJsonSerializerSettings { UseSimpleDictionaryFormat = true });

            using (var stream = new MemoryStream())
            {
                serializer.WriteObject(stream, obj);
                stream.Position = 0;
                using (var reader = new StreamReader(stream))
                {
                    json = reader.ReadToEnd();
                }
            }

            return json;

        }

        /// <summary>
        /// Deserializes JSON string to instance of object type
        /// </summary>
        /// <param name="jsonString">String to deserialize</param>
        /// <returns>Raw object</returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2202:Do not dispose objects multiple times")]
        internal static object Deserialize(string jsonString)
        {
            if (jsonString == null)
            {
                return null;
            }

            var returnObject = new object();
            if (jsonString == string.Empty)
            {
                return returnObject;
            }

            var ser = new DataContractJsonSerializer(returnObject.GetType());
            using (var stream = new MemoryStream())
            {
                using (var writer = new StreamWriter(stream))
                {
                    writer.Write(jsonString);
                    writer.Flush();
                    stream.Position = 0;
                    returnObject = ser.ReadObject(stream);
                }
            }

            return returnObject;
        }

        /// <summary>
        /// Deserializes JSON string to instance of object type
        /// </summary>
        /// <param name="jsonString">String to deserialize</param>
        /// <returns>Raw object</returns>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2202:Do not dispose objects multiple times")]
        internal static T Deserialize<T>(string jsonString)
        {
            if (string.IsNullOrEmpty(jsonString))
            {
                return default(T);
            }

            object returnObject;
            var ser = new DataContractJsonSerializer(typeof(T));

            using (var stream = new MemoryStream())
            {
                using (var writer = new StreamWriter(stream))
                {
                    writer.Write(jsonString);
                    writer.Flush();
                    stream.Position = 0;
                    returnObject = ser.ReadObject(stream);
                }
            }

            return (T)returnObject;
        }

        /// <summary>
        /// Parses MsgArg structure to raw object that could be serialized into JSON
        /// Respects all MsgArg signatures, including arrays and structs
        /// </summary>
        /// <param name="inValue">MsgArg object, or array/dictionary that contains MsgArg objects inside</param>
        /// <returns>parsed raw odject</returns>
        internal static object ParseMsgArg(object inValue)
        {

            var result = inValue;

            #region treat as MsgArg
            if (inValue is AllJoynUnity.AllJoyn.MsgArg)
            {
                var msgArgValue = inValue as AllJoynUnity.AllJoyn.MsgArg;
                var status = msgArgValue.Get(msgArgValue.Signature, out result);
                if (!status)
                {
                    throw new InvalidDataException(String.Format("Failed to get value from MsgArg: {0}", status));
                }
            }

            // if after parsing we got an MsgArg again, we need to do another pass
            // This is usually happens when some data inside of MsgArg is being wrapped
            // into variant type
            if (result is AllJoynUnity.AllJoyn.MsgArg)
            {
                result = ParseMsgArg(result);
            }

            #endregion

            #region treat as Array
            var arrayValue = result as object[];
            if (arrayValue != null)
            {
                for (var i = 0; i < arrayValue.Length; i++)
                {
                    arrayValue[i] = ParseMsgArg(arrayValue[i]);
                }
                result = arrayValue;
            }
            #endregion

            #region treat as Dictionary
            var dictValue = result as Dictionary<object, object>;
            if (dictValue != null)
            {
                foreach (var key in dictValue.Keys.ToList())
                {
                    dictValue[key] = ParseMsgArg(dictValue[key]);
                }
                result = dictValue;
            }
            #endregion

            return result;
        }

        #region Extension methods

        /// <summary>
        /// Gets array item at index p.
        /// </summary>
        /// <param name="args">Array of strings</param>
        /// <param name="p">Index of array element to retrieve</param>
        /// <returns>Array item at index p or null if array is shorter than p</returns>
        internal static string GetArg(this string[] args, int p)
        {
            try
            {
                return args[p];
            }
            catch (IndexOutOfRangeException)
            {
                return null;
            }
        }

        internal static Guid GetGuid(this string[] args, int p = 0)
        {
            try
            {
                return new Guid(args[p]);
            }
            catch (Exception)
            {
                return new Guid();
            }
        }

        internal static BusAttachment GetBusAttachment(this string[] args, int p = 0)
        {
            try
            {
                var busId = new Guid(args.GetArg(p));
                return CordovaProxy.Attachments[busId];
            }
            catch (Exception)
            {
                return null;
            }
        }

        internal static InterfaceDescription GetInterfaceDescription(this string[] args, int p = 0)
        {
            try
            {
                var ifaceId = new Guid(args.GetArg(p));
                return CordovaProxy.Interfaces[ifaceId];
            }
            catch (Exception)
            {
                return null;
            }
        }

        internal static ProxyBusObject GetProxyBusObject(this string[] args, int p = 0)
        {
            try
            {
                var ifaceId = new Guid(args.GetArg(p));
                return CordovaProxy.Proxies[ifaceId];
            }
            catch (Exception)
            {
                return null;
            }
        }

        internal static Guid GetIdForInterfaceDescription(this Dictionary<Guid, InterfaceDescription> interfaces,
            InterfaceDescription interfaceDesc)
        {
            return interfaces.Where(pair => pair.Value == interfaceDesc).Select(pair => pair.Key).FirstOrDefault();
        }

        internal static T TryParse<T>(this string[] args, int p = 0)
        {
            var arg = args.GetArg(p);
            if (arg != null)
            {
                var method = typeof (T).GetRuntimeMethod("Parse", new[] {typeof (string)});
                if (method != null)
                {
                    try
                    {
                        var result = method.Invoke(null, new object[] {arg});
                        return (T) result;
                    }
                    // If any errors here, ignore them and return default value for T
                    // ReSharper disable once EmptyGeneralCatchClause
                    catch
                    {
                    }
                }
            }
            return default(T);
        }

        #endregion Extension methods
    }
}
