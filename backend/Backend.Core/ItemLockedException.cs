using System;
using System.Runtime.Serialization;

namespace Backend.Core
{
    [Serializable]
    internal class ItemLockedException : Exception
    { 
    }
}