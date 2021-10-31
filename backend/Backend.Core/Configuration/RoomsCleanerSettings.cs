using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Core.Configuration
{
    public class RoomsCleanerSettings
    {
        public int CleaningIntervalInSeconds { get; set; }
        public int SecondsThreshold { get; set; }
    }
}
